// Light lag between Earth and the ship. The ship keeps accelerating, so a message sent later
// takes longer to catch up: `lag(day) = min(7, ceil(day / 4))` ship days.

import type { Message } from "../types";

export const ARRIVAL_DAY = 30;
const MAX_LAG = 7;
const DAYS_PER_LAG_STEP = 4;

export const lag = (day: number): number => Math.min(MAX_LAG, Math.ceil(day / DAYS_PER_LAG_STEP));

/** Ship day on which a message sent on Earth day `earthDay` reaches the ship. */
export const arrivalDay = (earthDay: number): number => earthDay + lag(earthDay);

/** Messages reaching the ship on `day`, in content order. */
export const messagesArriving = (messages: readonly Message[], day: number): readonly Message[] =>
  messages.filter((message) => arrivalDay(message.earthDay) === day);
