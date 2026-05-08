import type { UserProfile } from "./types";

export type AccentKey = UserProfile["accent"];

interface AccentDef {
  /** rgb triplet "R G B" — used in CSS via rgb(var(--accent)) */
  primary: string;
  secondary: string;
  /** Hex versions for direct stroke / fill colour props (charts, ProgressRing). */
  hex: string;
  hex2: string;
  /** Friendly label shown in Settings. */
  label: string;
}

export const ACCENTS: Record<AccentKey, AccentDef> = {
  cyan: {
    primary: "34 211 238",
    secondary: "168 85 247",
    hex: "#22d3ee",
    hex2: "#a78bfa",
    label: "Cyan",
  },
  violet: {
    primary: "168 85 247",
    secondary: "34 211 238",
    hex: "#a78bfa",
    hex2: "#22d3ee",
    label: "Violet",
  },
  emerald: {
    primary: "52 211 153",
    secondary: "34 211 238",
    hex: "#34d399",
    hex2: "#22d3ee",
    label: "Emerald",
  },
  amber: {
    primary: "245 158 11",
    secondary: "168 85 247",
    hex: "#f59e0b",
    hex2: "#a78bfa",
    label: "Amber",
  },
  rose: {
    primary: "251 113 133",
    secondary: "34 211 238",
    hex: "#fb7185",
    hex2: "#22d3ee",
    label: "Rose",
  },
};

export function applyAccent(accent: AccentKey | undefined) {
  if (typeof document === "undefined") return;
  const a = ACCENTS[accent ?? "cyan"] ?? ACCENTS.cyan;
  document.documentElement.style.setProperty("--accent", a.primary);
  document.documentElement.style.setProperty("--accent-2", a.secondary);
}

export function accentHex(accent: AccentKey | undefined): string {
  return (ACCENTS[accent ?? "cyan"] ?? ACCENTS.cyan).hex;
}

export function accentHex2(accent: AccentKey | undefined): string {
  return (ACCENTS[accent ?? "cyan"] ?? ACCENTS.cyan).hex2;
}
