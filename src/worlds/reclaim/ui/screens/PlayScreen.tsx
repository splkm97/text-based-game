// 플레이 화면 — 지금 상태가 어느 화면인지 고르는 배선만 한다. 체인 절차가 끼어 있으면
// 절차 화면, 아니면 일감의 순서(office → briefing → party → cleanup → site)가 화면을 정한다.
//
// 아침 조회(office)는 한 단계가 아니라 두 화면이다: 산문 화면(officeStage "scene")을 읽고
// 사람들 화면("people")으로 건너간 뒤, 그 자리에서 말을 걸면 면담 화면이 그 위에 덮인다.
// 어느 화면을 그릴지는 상태가 정하고, 무엇이 열려 있는지는 규칙이 정한다.
//
// 가드는 규칙의 것이다: 화면은 availableActions·lastReason·act만 쓰고 판정하지 않는다
// (거부도 예외가 아니라 문면이다). 종결 상태에서는 null을 돌려준다 — 종결 화면은 App의
// EndingScreen이 그린다(계약).

import { JOB_IDS } from "../../ids";
import { useContent } from "../contentContext";
import { useRunStore } from "../runStoreContext";
import { BriefingScreen } from "./BriefingScreen";
import { ChainScreen } from "./ChainScreen";
import { CleanupScreen } from "./CleanupScreen";
import { InterviewScreen } from "./InterviewScreen";
import { OfficePeopleScreen } from "./OfficePeopleScreen";
import { OfficeSceneScreen } from "./OfficeSceneScreen";
import { PartyScreen } from "./PartyScreen";
import { SiteScreen } from "./SiteScreen";

export function PlayScreen() {
  const run = useRunStore((state) => state.run);
  const content = useContent();

  if (run === null || run.terminal !== null) {
    return null;
  }
  if (run.chainStep !== null) {
    return <ChainScreen run={run} chain={content.chains[run.chainStep]} />;
  }
  const jobId = JOB_IDS[run.jobIndex];
  if (jobId === undefined) {
    // 마지막 일감 뒤에는 규칙이 체인 절차나 종결로 보낸다 — 여기 남는 경우는 없다.
    return null;
  }
  const job = content.jobs[jobId];
  if (run.jobStep === "office") {
    if (run.interview !== null) {
      return <InterviewScreen job={job} interview={run.interview} />;
    }
    return run.officeStage === "scene" ? (
      <OfficeSceneScreen job={job} />
    ) : (
      <OfficePeopleScreen run={run} job={job} />
    );
  }
  if (run.jobStep === "briefing") {
    return <BriefingScreen job={job} />;
  }
  if (run.jobStep === "party") {
    return <PartyScreen run={run} job={job} />;
  }
  if (run.jobStep === "cleanup") {
    return <CleanupScreen run={run} job={job} />;
  }
  return <SiteScreen run={run} job={job} />;
}
