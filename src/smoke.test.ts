import { expect, test } from "vitest";
import * as appModule from "./App";

test("App module exports a function named App", () => {
  expect(typeof appModule.App).toBe("function");
  expect(appModule.App.name).toBe("App");
});
