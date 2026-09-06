// Typed rule failures. Every invalid input or phase throws `RulesError`; the UI maps `code`.

export type RulesErrorCode =
  | "INVALID_PHASE"
  | "INVALID_CHOICE"
  | "INVALID_TARGET"
  | "NO_AP"
  | "NO_RESOURCE"
  | "UNKNOWN_ID";

export class RulesError extends Error {
  readonly code: RulesErrorCode;

  constructor(code: RulesErrorCode, message: string) {
    super(message);
    this.name = "RulesError";
    this.code = code;
  }
}
