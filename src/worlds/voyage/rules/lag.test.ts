import { describe, expect, test } from "vitest";
import type { Message } from "../types";
import { arrivalDay, lag, messagesArriving } from "./lag";

describe("lag", () => {
  test.each([
    [1, 1],
    [4, 1],
    [5, 2],
    [8, 2],
    [9, 3],
    [12, 3],
    [13, 4],
    [16, 4],
    [17, 5],
    [20, 5],
    [21, 6],
    [24, 6],
    [25, 7],
    [28, 7],
    [40, 7],
  ])("day %i lags %i", (day, expected) => {
    expect(lag(day)).toBe(expected);
  });

  test("a message arrives on earthDay + lag(earthDay)", () => {
    expect(arrivalDay(1)).toBe(2);
    expect(arrivalDay(24)).toBe(30);
  });
});

describe("messagesArriving", () => {
  const message = (id: string, earthDay: number): Message => ({
    id,
    earthDay,
    title: id,
    text: id,
    reveals: {},
  });

  test("returns the messages whose arrival day matches, in content order", () => {
    const messages = [message("a", 1), message("b", 4), message("c", 2), message("d", 4)];
    expect(messagesArriving(messages, 5).map((m) => m.id)).toEqual(["b", "d"]);
    expect(messagesArriving(messages, 3).map((m) => m.id)).toEqual(["c"]);
    expect(messagesArriving(messages, 1)).toEqual([]);
  });
});
