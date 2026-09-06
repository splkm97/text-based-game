// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { META } from "../worlds/adventurer/meta";
import { HostApp } from "./HostApp";
import { themeStyle } from "./theme";

afterEach(cleanup);

test("the hub lists the adventurer world; starting it opens its title screen, and 허브로 returns", async () => {
  render(<HostApp />);
  expect(screen.getByRole("heading", { name: "TXT GAME BOX" })).toBeDefined();
  expect(screen.getByRole("heading", { name: META.title })).toBeDefined();
  await userEvent.click(screen.getByRole("button", { name: `${META.title} 시작` }));
  expect(await screen.findByRole("button", { name: "새 모험" })).toBeDefined();
  expect(screen.queryByRole("heading", { name: "TXT GAME BOX" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "허브로" }));
  expect(screen.getByRole("heading", { name: "TXT GAME BOX" })).toBeDefined();
});

test("themeStyle maps each token to its CSS variable", () => {
  expect(themeStyle(META.theme)).toHaveProperty("--color-ember", META.theme.tokens.ember);
});
