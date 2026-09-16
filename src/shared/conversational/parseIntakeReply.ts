export function parsePlainText(raw: string): { valid: boolean; value: string; error?: string } {
  const value = raw.trim();
  if (!value) return { valid: false, value: "", error: "Say a bit more — I need something to work with." };
  return { valid: true, value };
}

export function parseDollars(raw: string): { valid: boolean; value: number; error?: string } {
  const n = Number(raw.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) {
    return { valid: false, value: 0, error: "Give me a positive dollar amount (e.g. 120000 or $120k)." };
  }
  return { valid: true, value: n };
}

export function parsePositiveInt(
  raw: string,
  label = "number"
): { valid: boolean; value: number; error?: string } {
  const n = Number(raw.replace(/[,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    return { valid: false, value: 0, error: `I need a whole ${label} greater than zero.` };
  }
  return { valid: true, value: n };
}

export function parseHeadcount(raw: string): { valid: boolean; value: number; error?: string } {
  const n = Number(raw.replace(/[,\s]/g, ""));
  if (!Number.isFinite(n) || n < 4 || n > 8) {
    return { valid: false, value: 6, error: "For the draft board, pick a number between 4 and 8 stakeholders." };
  }
  return { valid: true, value: Math.round(n) };
}

export function parseHourlyCost(raw: string): { valid: boolean; value: number; error?: string } {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed === "default" || trimmed === "skip") {
    return { valid: true, value: 85 };
  }
  return parseDollars(raw);
}
