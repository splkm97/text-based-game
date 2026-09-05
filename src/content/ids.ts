// Fixed id catalog. Content tasks use these ids verbatim and may not add ids.
// The trailing comment on each id is its Korean display name.

export const ITEM_IDS = [
  // weapons: one-hand physical (6)
  "rusty_sword", // 녹슨 검
  "hunter_knife", // 사냥꾼의 단검
  "iron_mace", // 철 철퇴
  "guard_saber", // 경비대 사브르
  "silver_rapier", // 은빛 레이피어
  "moonsteel_blade", // 달강철 검
  // weapons: two-hand physical (3)
  "woodcutter_axe", // 나무꾼의 도끼
  "pike_of_the_watch", // 파수대의 장창
  "giant_cleaver", // 거인의 식칼
  // weapons: magic (2)
  "apprentice_wand", // 견습생의 지팡이
  "ashwood_staff", // 물푸레나무 지팡이
  // weapons: ranged (3)
  "short_bow", // 단궁
  "hunting_crossbow", // 사냥용 석궁
  "elm_longbow", // 느릅나무 장궁
  // shields (4)
  "plank_buckler", // 널빤지 버클러
  "kite_shield", // 연 방패
  "tower_shield", // 탑 방패
  "mirror_shield", // 거울 방패
  // armor (6)
  "travel_cloak", // 여행자의 망토
  "padded_jerkin", // 누비 조끼
  "chain_shirt", // 사슬 셔츠
  "scale_mail", // 비늘 갑옷
  "knight_plate", // 기사의 판금 갑옷
  "shadow_leathers", // 그림자 가죽옷
  // relics (6)
  "lucky_coin", // 행운의 동전
  "owl_pendant", // 올빼미 펜던트
  "iron_ring", // 철 반지
  "sage_spectacles", // 현자의 안경
  "hermit_beads", // 은둔자의 염주
  "kings_signet", // 왕의 인장 반지
  // consumables (10)
  "bread_loaf", // 빵 한 덩이
  "healing_salve", // 치유 연고
  "strong_wine", // 독한 포도주
  "calming_tea", // 진정의 차
  "antidote", // 해독제
  "torch", // 횃불
  "rope", // 밧줄
  "holy_water", // 성수
  "dream_powder", // 꿈의 가루
  "elixir_of_vigor", // 활력의 영약
] as const;
export type ItemId = (typeof ITEM_IDS)[number];

export const MONSTER_IDS = [
  "wild_boar", // 멧돼지
  "road_bandit", // 노상강도
  "giant_rat", // 거대 쥐
  "cave_bat", // 동굴 박쥐
  "goblin_scout", // 고블린 정찰병
  "goblin_chief", // 고블린 족장
  "gray_wolf", // 회색 늑대
  "bog_slime", // 늪 슬라임
  "skeleton_guard", // 해골 경비병
  "restless_ghost", // 떠도는 유령
  "hill_troll", // 언덕 트롤
  "harpy", // 하피
  "bandit_captain", // 산적 두목
  "cursed_knight", // 저주받은 기사
  "swamp_hag", // 늪지 마녀
  "stone_gargoyle", // 석상 가고일
  "young_wyvern", // 어린 와이번
  "mine_horror", // 광산의 공포
  "frost_giant", // 서리 거인
  "dragon_of_ash", // 잿빛 용
] as const;
export type MonsterId = (typeof MONSTER_IDS)[number];

export const TRAIT_IDS = [
  "strong_arms", // 억센 팔
  "quick_feet", // 빠른 발
  "bookworm", // 책벌레
  "silver_tongue", // 은빛 혀
  "iron_body", // 강철 육체
  "keen_eyes", // 예리한 눈
  "miser", // 구두쇠
  "late_bloomer", // 대기만성
  "berserker", // 광전사
  "steel_mind", // 강철 정신
] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export const ORIGIN_IDS = [
  "origin_mercenary", // 떠돌이 용병
  "origin_monk", // 파문당한 수도사
  "origin_heir", // 몰락한 가문의 후계자
] as const;
export type OriginId = (typeof ORIGIN_IDS)[number];

export const JOURNEY_IDS = [
  "journey_circus", // 달빛 서커스단
  "journey_lighthouse", // 잊힌 등대
  "journey_debt", // 지하 시장의 빚
] as const;
export type JourneyId = (typeof JOURNEY_IDS)[number];

export const ENDING_IDS = [
  "death", // 죽음
  "madness", // 광기
  "retire", // 은퇴
  "mercenary_banner", // 용병의 깃발
  "mercenary_betrayal", // 용병의 배신
  "monk_absolution", // 수도사의 사면
  "monk_heresy", // 수도사의 이단
  "heir_restored", // 되찾은 가문
  "heir_exile", // 추방된 후계자
  "circus_finale", // 서커스의 피날레
  "lighthouse_keeper", // 등대지기
  "debt_settled", // 청산된 빚
] as const;
export type EndingId = (typeof ENDING_IDS)[number];

/** Content defines many events, so `EventId` stays open. */
export type EventId = string;

/** The engine falls back to this event when no candidate event qualifies. Content must define it. */
export const FALLBACK_EVENT_ID = "fallback_rest"; // 휴식
