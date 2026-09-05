// Combat: the player acts first each round, then the monster retaliates if it still stands.

import { deriveStats, effectiveStats } from "./character";
import { resolveCheck } from "./checks";
import { applyConsumable, applyEffects } from "./effects";
import { finishRun } from "./endings";
import { enterResolution, requirePhase } from "./phase";
import { rollD20 } from "./rng";
import type {
  CombatState,
  ContentRegistry,
  Effect,
  ItemId,
  Monster,
  MonsterId,
  OutcomeText,
  Rng,
  RunState,
} from "./types";

const HARD_MODE_HP_MULTIPLIER = 1.25;
const HARD_MODE_ATTACK_BONUS = 1;
const FUMBLE_MULTIPLIER = 2;

type PlayerAction = {
  readonly monsterHp: number;
  readonly fumbleDamage: number;
  readonly line: string;
};

export const startCombat = (
  run: RunState,
  monsterId: MonsterId,
  onWin: OutcomeText,
  onFlee: OutcomeText,
  content: ContentRegistry,
): RunState => {
  const monster = content.monsters[monsterId];
  const hp = run.hardMode ? Math.ceil(monster.hp * HARD_MODE_HP_MULTIPLIER) : monster.hp;
  const combat: CombatState = {
    monster: monsterId,
    monsterHp: hp,
    monsterMaxHp: hp,
    round: 1,
    log: [`${monster.name}이(가) 나타났다!`],
    onWin,
    onFlee,
  };
  return { ...run, phase: { kind: "combat", combat } };
};

const monsterAttack = (run: RunState, monster: Monster): number =>
  monster.attack + (run.hardMode ? HARD_MODE_ATTACK_BONUS : 0);

const playerAction = (
  roll: number,
  attack: number,
  monster: Monster,
  monsterAttackValue: number,
  monsterHp: number,
): PlayerAction => {
  if (roll === 20) {
    return {
      monsterHp: 0,
      fumbleDamage: 0,
      line: `치명타! ${monster.name}을(를) 단숨에 쓰러뜨렸다.`,
    };
  }
  if (roll === 1) {
    const damage = monsterAttackValue * FUMBLE_MULTIPLIER;
    return { monsterHp, fumbleDamage: damage, line: `실수! 허점을 찔려 ${damage} 피해를 입었다.` };
  }
  if (roll + attack >= monster.defense) {
    return {
      monsterHp: Math.max(0, monsterHp - attack),
      fumbleDamage: 0,
      line: `명중 (d20 ${roll}): ${monster.name}에게 ${attack} 피해`,
    };
  }
  return { monsterHp, fumbleDamage: 0, line: `빗나감 (d20 ${roll})` };
};

/** Damage the player takes, hp applied, and the continuation: win, death, or the next round. */
const settleRound = (
  run: RunState,
  combat: CombatState,
  monster: Monster,
  monsterHp: number,
  damage: number,
  lines: readonly string[],
  content: ContentRegistry,
): RunState => {
  const hp = Math.max(0, run.character.hp - damage);
  const hurt: RunState = { ...run, character: { ...run.character, hp } };
  const roundLog = [...lines];
  if (monsterHp <= 0) {
    return winCombat(hurt, combat, monster, roundLog, content);
  }
  if (hp <= 0) {
    return finishRun(appendCombatLog(hurt, combat, monsterHp, roundLog), "death", content);
  }
  return appendCombatLog(hurt, combat, monsterHp, roundLog);
};

const appendCombatLog = (
  run: RunState,
  combat: CombatState,
  monsterHp: number,
  lines: readonly string[],
): RunState => ({
  ...run,
  phase: {
    kind: "combat",
    combat: { ...combat, monsterHp, round: combat.round + 1, log: [...combat.log, ...lines] },
  },
});

const winCombat = (
  run: RunState,
  combat: CombatState,
  monster: Monster,
  roundLog: readonly string[],
  content: ContentRegistry,
): RunState => {
  const rewards: readonly Effect[] = [
    { kind: "xp", delta: monster.xpReward },
    { kind: "gold", delta: monster.goldReward },
    ...(monster.drop === undefined ? [] : [{ kind: "item", item: monster.drop } as const]),
  ];
  const rewarded = applyEffects({ ...run, kills: run.kills + 1 }, rewards, content);
  const outcome = applyEffects(rewarded.run, combat.onWin.effects, content);
  return enterResolution(outcome.run, combat.onWin.text, [
    ...roundLog,
    ...rewarded.log,
    ...outcome.log,
  ]);
};

export const combatRound = (run: RunState, content: ContentRegistry, rng: Rng): RunState => {
  const { combat } = requirePhase(run, "combat");
  const monster = content.monsters[combat.monster];
  const { attack, defense } = deriveStats(run.character, content);
  const monsterAttackValue = monsterAttack(run, monster);
  const roll = rollD20(rng);
  const action = playerAction(roll, attack, monster, monsterAttackValue, combat.monsterHp);
  // A fumble replaces the monster's normal strike: the fumble line alone carries the damage.
  const retaliates = action.monsterHp > 0 && roll !== 1;
  const retaliation = retaliates ? Math.max(0, monsterAttackValue - defense) : 0;
  const lines = retaliates
    ? [action.line, `${monster.name}의 공격: ${retaliation} 피해`]
    : [action.line];
  return settleRound(
    run,
    combat,
    monster,
    action.monsterHp,
    action.fumbleDamage + retaliation,
    lines,
    content,
  );
};

/** Agility check against `fleeDc`. Success leaves combat with no reward; failure costs a monster strike. */
export const attemptFlee = (run: RunState, content: ContentRegistry, rng: Rng): RunState => {
  const { combat } = requirePhase(run, "combat");
  const monster = content.monsters[combat.monster];
  const { roll, success } = resolveCheck(
    effectiveStats(run.character, content).agi,
    monster.fleeDc,
    rng,
  );
  if (success) {
    const outcome = applyEffects(run, combat.onFlee.effects, content);
    return enterResolution(outcome.run, combat.onFlee.text, [
      `도주 성공 (d20 ${roll})`,
      ...outcome.log,
    ]);
  }
  const damage = Math.max(
    0,
    monsterAttack(run, monster) - deriveStats(run.character, content).defense,
  );
  return settleRound(
    run,
    combat,
    monster,
    combat.monsterHp,
    damage,
    [`도주 실패 (d20 ${roll}): ${damage} 피해`],
    content,
  );
};

/** Using an item consumes the player's action: the monster strikes once afterwards. */
export const consumeItemInCombat = (
  run: RunState,
  item: ItemId,
  content: ContentRegistry,
): RunState => {
  const { combat } = requirePhase(run, "combat");
  const monster = content.monsters[combat.monster];
  const used = applyConsumable(run, item, content);
  const damage = Math.max(
    0,
    monsterAttack(run, monster) - deriveStats(used.run.character, content).defense,
  );
  return settleRound(
    used.run,
    combat,
    monster,
    combat.monsterHp,
    damage,
    [...used.log, `${monster.name}의 공격: ${damage} 피해`],
    content,
  );
};
