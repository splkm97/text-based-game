// The single content registry a store injects into the rules.
//
// Every record was assembled in its own file, keyed by the world's id unions, so `Content`
// is total by construction: a missing id is a compile error, not a blank card at runtime.
// Jobs walk office → briefing → party → cleanup → site (content/jobs.ts); chains are the
// condition-triggered procedures that slot between jobs (content/chains.ts). The cleanup
// procedure itself is world-common, so its four task names live here, not per job.
//
// The names are what the 뒷정리 buttons say: they carry no order, because the instruction
// sheet (`jobs[*].site.document`) is the single clue the ordering puzzle has.

import type { CleanupTaskId } from "../ids";
import type { Content } from "../types";
import { ACTIONS_TEXT } from "./actions";
import { CHAINS } from "./chains";
import { CHARACTERS } from "./characters";
import { ENDINGS } from "./endings";
import { JOBS } from "./jobs";

/** 지침서가 정한 순서의 작업 넷 — 이름에는 차례를 흘리지 않는다. */
const CLEANUP_TASKS: Readonly<Record<CleanupTaskId, string>> = {
  sign: "안전 표지와 통제선을 세운다",
  power: "전원과 가스관을 차단한다",
  search: "잔해 안쪽의 사람과 위험을 확인한다",
  photo: "위치와 수치를 기록한다",
};

export const CONTENT: Content = {
  jobs: JOBS,
  chains: CHAINS,
  actions: ACTIONS_TEXT,
  endings: ENDINGS,
  characters: CHARACTERS,
  cleanupTasks: CLEANUP_TASKS,
};
