import { colors } from "./tokens";

export const lightTheme = {
  pageBg: colors.white,
  cardBg: colors.white,
  panelBg: "rgba(255, 255, 255, 0.96)",
  border: "#e8e8e8",
  text: "#111111",
  muted: "#6f6f6f",
  subdued: "#4f4f4f",
  chipBg: "#f7f7f7",
  chipText: "#111111",
  accent: "#111111",
  cluster: "#111111",
  visited: colors.teal700,
  badgeBg: colors.emerald100,
  badgeText: colors.emerald800,
  mapBgStart: colors.mapWater,
  mapBgEnd: colors.mapLand,
};

export const darkTheme = {
  pageBg: colors.slate900,
  cardBg: colors.slate800,
  panelBg: "rgba(30, 41, 59, 0.96)",
  border: colors.slate700,
  text: colors.slate50,
  muted: colors.gray300,
  subdued: colors.slate200,
  chipBg: colors.slate700,
  chipText: colors.slate50,
  accent: colors.red400,
  cluster: colors.red500,
  visited: colors.teal200,
  badgeBg: colors.teal900,
  badgeText: colors.teal100,
  mapBgStart: colors.slate700,
  mapBgEnd: colors.slate900,
};

export const mapTheme = {
  visitedFill: "rgba(20, 184, 166, 0.22)",
  visitedGlow: "rgba(15, 118, 110, 0.1)",
  gridLine: "rgba(2, 74, 216, 0.06)",
};
