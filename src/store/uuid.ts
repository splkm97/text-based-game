// `crypto.randomUUID` is undefined outside a secure context (e.g. a plain-http LAN preview).
// `crypto.getRandomValues` stays available there, so it backs the fallback.

/** Pure formatter: 16 random bytes -> an RFC 4122 v4 UUID string. Exported for testing. */
export const uuidFromBytes = (raw: Uint8Array): string => {
  const version = ((raw[6] ?? 0) & 0x0f) | 0x40;
  const variant = ((raw[8] ?? 0) & 0x3f) | 0x80;
  const bytes = raw.with(6, version).with(8, variant);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const uuid = (): string =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : uuidFromBytes(crypto.getRandomValues(new Uint8Array(16)));
