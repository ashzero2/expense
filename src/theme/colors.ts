import { adjustHex } from "./colorUtils";
import type { Theme } from "./theme";

export const palette = {
  bg: "#282C34",

  red: "#E06C75",
  green: "#98C379",
  yellow: "#E5C07B",
  blue: "#61AFEF",
  purple: "#C678DD",
  teal: "#56B6C2",

  gray: "#ABB2BF",
};

const lightBaseSurface = "#F3F4F6";
export const lightTheme: Theme = {
  background: "#FFFFFF",
  surface: lightBaseSurface,
  surfaceRaised: adjustHex(lightBaseSurface, -10),
  surfacePressed: adjustHex(lightBaseSurface, -20),
  card: "#F9FAFB",

  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",

  primary: "#3B82F6",
  accent: "#06B6D4",

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",

  chart: {
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B",
    red: "#EF4444",
    purple: "#8B5CF6",
    teal: "#06B6D4",
  },
};

const baseSurface = "#1F2329";
export const darkTheme: Theme = {
  background: palette.bg,
  surface: baseSurface,
  surfaceRaised: adjustHex(baseSurface, 10),
  surfacePressed: adjustHex(baseSurface, -6),
  card: "#2C313A",

  text: "#FFFFFF",
  subtext: palette.gray,
  border: "#3E4451",

  primary: palette.blue,
  accent: palette.teal,

  success: palette.green,
  warning: palette.yellow,
  danger: palette.red,

  chart: {
    blue: palette.blue,
    green: palette.green,
    yellow: palette.yellow,
    red: palette.red,
    purple: palette.purple,
    teal: palette.teal,
  },
};
