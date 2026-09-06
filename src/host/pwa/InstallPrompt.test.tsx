// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { InstallPrompt } from "./InstallPrompt";

const offerInstall = () => {
  const prompt = vi.fn(() => Promise.resolve());
  act(() => {
    window.dispatchEvent(Object.assign(new Event("beforeinstallprompt"), { prompt }));
  });
  return prompt;
};

afterEach(cleanup);

test("the banner appears once the browser offers install, and accepting calls prompt", async () => {
  render(<InstallPrompt />);
  expect(screen.queryByRole("button", { name: "홈 화면에 추가" })).toBeNull();
  const prompt = offerInstall();
  await userEvent.click(screen.getByRole("button", { name: "홈 화면에 추가" }));
  expect(prompt).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("button", { name: "홈 화면에 추가" })).toBeNull();
});

test("closing the banner hides it without prompting", async () => {
  render(<InstallPrompt />);
  const prompt = offerInstall();
  await userEvent.click(screen.getByRole("button", { name: "닫기" }));
  expect(prompt).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "홈 화면에 추가" })).toBeNull();
});
