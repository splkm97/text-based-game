// prototype/remains.json에서 뽑은 서사적 사실 목록 — 구조·범례·mermaid·경로 참조 같은 저작
// 메타데이터는 뺀다. 각 사실은 CONTENT의 문면 어딘가에 keywords 중 하나 이상으로 나타나야
// 한다(coverage.test.ts). secret 사실은 관악(gwanak, 첫 일감) 범위 밖에서만 나타나야 한다 —
// 관악은 튜토리얼 쿠션이라 후반 개념·비밀 게이트를 심지 않는다(기존 GATE_WORDS 관례와 같다).
// 숫자·미터를 요구하는 사실(설계 §4.1: 화면에 숫자를 노출하지 않는다), 아직 구현되지 않은
// 메커니즘(파산 엔딩 등), 사용자 결정으로 이 월드에서 끝내 공개하지 않기로 한 정체(반장의
// 비밀요원 신분·배태산의 실세 신분)는 excluded로 표시하고 이유를 남긴다 — 게임이 다루지
// 않기로 정한 사실이지, 빠뜨린 사실이 아니다.

export type LedgerFact = {
  readonly id: string;
  /** 원장 근거 경로(문서화용, 코드가 참조하지 않는다). */
  readonly source: string;
  /** 이 중 하나라도 문면에 나타나면 커버된 것으로 본다. */
  readonly keywords: readonly string[];
  /** 게임 시작 시점에 공개되지 않는 세계의 비밀 — 관악 범위 밖에서만 나타나야 한다. */
  readonly secret?: true;
};

export const LEDGER_FACTS: readonly LedgerFact[] = [
  // --- settings.association ---
  {
    id: "association-common-name",
    source: "settings.association.commonName/nameUsage",
    keywords: ["협회"],
  },
  {
    id: "association-official-name",
    source: "settings.association.officialName",
    keywords: ["서울특별시 괴수재해대처본부 도시재건협회"],
  },
  {
    id: "association-appearance-channels",
    source: "settings.association.appearanceChannels",
    keywords: ["공문", "청구", "방송"],
  },
  {
    id: "association-registration-grades",
    source: "settings.association.heroRegistrationGrades",
    keywords: ["퇴역 히어로", "루키", "빌런", "히어로"],
  },
  {
    id: "association-monster-alert-grades",
    source: "settings.association.monsterAlertGrades",
    keywords: ["특보", "경보", "주의보", "해제"],
  },
  {
    id: "association-secret-summoning",
    source: "settings.association.secretSummoning",
    keywords: ["소환"],
    secret: true,
  },
  {
    id: "association-secret-government-tie",
    source: "settings.association.secretGovernmentTie",
    keywords: ["한통속", "인멸"],
    secret: true,
  },
  {
    id: "association-secret-covert-action",
    source: "settings.association.secretCovertAction",
    keywords: ["제3자", "안다는 사실", "스스로 나서지 않는다", "직접 나서지"],
    secret: true,
  },
  // --- settings.company ---
  {
    id: "company-type-role",
    source: "settings.company.type/playerRole",
    keywords: ["토목 회사", "사장님"],
  },
  {
    id: "company-core-mission",
    source: "settings.company.coreMission",
    keywords: ["잔해", "복구"],
  },
  {
    id: "company-combat-position",
    source: "settings.company.combatPosition",
    keywords: ["뒷정리", "뒤처리"],
  },
  {
    id: "company-history",
    source: "settings.company.history",
    keywords: ["아버지", "도로와 다리"],
  },
  {
    id: "company-field-dispatch",
    source: "settings.company.fieldDispatch",
    keywords: ["동행", "마감"],
  },
  // --- settings.characters (공개 정보) ---
  {
    id: "dusik-financial-status",
    source: "settings.characters.dusik.financialStatus",
    keywords: ["압류", "배상금"],
  },
  {
    id: "dusik-registration-status",
    source: "settings.characters.dusik.heroHistory.registrationStatus",
    keywords: ["퇴역 히어로", "자격만료"],
  },
  {
    id: "dusik-motivation",
    source: "settings.characters.dusik.motivation",
    keywords: ["의심"],
  },
  {
    id: "dusik-true-ending",
    source: "settings.characters.dusik.trueEnding",
    keywords: ["군 소속 히어로", "배상금 청구의 효력이 정지"],
    secret: true,
  },
  {
    id: "ru-surface-rule",
    source: "settings.characters.ru.surfaceRule",
    keywords: ["짙은 녹색"],
  },
  {
    id: "ru-extraordinary-memory",
    source: "settings.characters.ru.extraordinaryMemory",
    keywords: ["외워", "외운"],
  },
  {
    id: "ru-hidden-identity",
    source: "settings.characters.ru.hiddenIdentity/separation.originalEntity",
    keywords: ["루시퍼"],
    secret: true,
  },
  {
    id: "ru-secret-reunion",
    source: "settings.characters.ru.separation.secretReunion",
    keywords: ["재통합", "하나로 합쳐", "하나가 되어"],
    secret: true,
  },
  {
    id: "taesan-traits",
    source: "settings.characters.taesan.traits",
    keywords: ["마당발", "유머"],
  },
  {
    id: "taesan-misnaming",
    source: "settings.characters.taesan.misnaming",
    keywords: ["배태식"],
  },
  // --- monsterRemnants ---
  {
    id: "monster-remnants-behavior",
    source: "settings.monsterRemnants.behavior",
    keywords: ["먼저 공격하지 않는다"],
  },
  {
    id: "monster-remnants-traces",
    source: "settings.monsterRemnants.traces",
    keywords: ["문양", "구조"],
  },
  // --- military ---
  {
    id: "military-independence",
    source: "settings.military.independence/heroTeamOperation",
    keywords: ["군", "히어로 팀"],
  },
  // --- endings evidence(진엔딩 경로 증거) ---
  {
    id: "dusik-route-broadcast-evidence",
    source: "trueEndingRoutes.dusik.evidence.broadcast",
    keywords: ["예측", "좌표"],
  },
  {
    id: "dusik-route-documents-evidence",
    source: "trueEndingRoutes.dusik.evidence.documents",
    keywords: ["기밀 문서고", "실험 기록"],
    secret: true,
  },
  {
    id: "ru-route-clue-relic",
    source: "trueEndingRoutes.ru.evidence.clue/relic",
    keywords: ["물건을 삼"],
    secret: true,
  },
];

/** 원장에 있으나 이번 텍스트 작업이 다루지 않기로 확정한 사실 — 빠뜨린 것이 아니라 정한 것이다. */
export const LEDGER_EXCLUSIONS: readonly { readonly path: string; readonly reason: string }[] = [
  {
    path: "narrativeRules.endingTypes.types[파산 엔딩]",
    reason: "game-mechanics.md 미정 메커니즘 — 텍스트 작업 범위 밖(사용자 결정 2026-09-14)",
  },
  {
    path: "settings.characters.dusik.heroHistory.careerLength 등 정확한 연·개월 수",
    reason: "설계 §4.1: 인물 상태·경력은 화면에 숫자로 노출하지 않는다",
  },
  {
    path: "trueEndingRoutes.banjang/taesan의 [?] 미확정 구간",
    reason: "경로 미기획 — 사용자 결정: 공개 정보와 힌트만, 진엔딩 경로 신설 안 함",
  },
  {
    path: "settings.characters.banjang.hiddenActivity (비밀요원)",
    reason:
      "사용자 결정 2026-09-14: 반장·태산은 공개 정보와 힌트만 — 정체는 이 월드에서 공개하지 않는다",
  },
  {
    path: "settings.characters.taesan.hiddenIdentity/secretScheme (협회의 실세)",
    reason:
      "사용자 결정 2026-09-14: 반장·태산은 공개 정보와 힌트만 — 정체는 이 월드에서 공개하지 않는다",
  },
];
