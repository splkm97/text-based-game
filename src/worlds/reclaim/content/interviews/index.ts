// 면담 16편의 조립 — 인물별 파일이 일감 축으로 카드를 갖고, 여기서 (일감 → 인물)로 뒤집는다.
// 화면은 `content.interviews[run.jobIndex]`가 아니라 `interviews[jobId][characterId]`로 찾는다.
//
// 카드 하나는 그 사람이 먼저 하는 말(opening, 여러 문단)과 응답 셋에 대한 답(replies)이다.
// 응답의 효과는 규칙이 정한다(rules/actions.ts): 일을 묻는다 → suspicion−1,
// 사정을 묻는다 → trust+1, 농담으로 넘긴다 → fatigue−1. 문면만 읽어도 그 뜻이 읽혀야 한다.

import { CHARACTER_IDS, type CharacterId, JOB_IDS, type JobId } from "../../ids";
import type { InterviewCard } from "../../types";
import { BANJANG_INTERVIEWS } from "./banjang";
import { DUSIK_INTERVIEWS } from "./dusik";
import { RU_INTERVIEWS } from "./ru";
import { TAESAN_INTERVIEWS } from "./taesan";

const BY_CHARACTER: Readonly<Record<CharacterId, Readonly<Record<JobId, InterviewCard>>>> = {
  dusik: DUSIK_INTERVIEWS,
  ru: RU_INTERVIEWS,
  banjang: BANJANG_INTERVIEWS,
  taesan: TAESAN_INTERVIEWS,
};

const forJob = (job: JobId): Readonly<Record<CharacterId, InterviewCard>> =>
  Object.fromEntries(CHARACTER_IDS.map((id) => [id, BY_CHARACTER[id][job]])) as Readonly<
    Record<CharacterId, InterviewCard>
  >;

export const INTERVIEWS: Readonly<Record<JobId, Readonly<Record<CharacterId, InterviewCard>>>> =
  Object.fromEntries(JOB_IDS.map((job) => [job, forJob(job)])) as Readonly<
    Record<JobId, Readonly<Record<CharacterId, InterviewCard>>>
  >;
