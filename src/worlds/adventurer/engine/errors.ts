// Typed engine failures. Every invalid input or phase throws `EngineError`; the UI maps `code`.

export type EngineErrorCode =
  | "INVALID_ALLOCATION"
  | "NO_STAT_POINTS"
  | "ITEM_NOT_IN_INVENTORY"
  | "INVALID_ITEM"
  | "SLOT_BLOCKED"
  | "INVENTORY_FULL"
  | "NOT_ENOUGH_GOLD"
  | "INVALID_PHASE"
  | "INVALID_CHOICE"
  | "UNKNOWN_ID";

export class EngineError extends Error {
  readonly code: EngineErrorCode;

  constructor(code: EngineErrorCode, message: string) {
    super(message);
    this.name = "EngineError";
    this.code = code;
  }
}
