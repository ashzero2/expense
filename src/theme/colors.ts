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

export const lightTheme: Theme = {
  background: palette.bg,
  surface: "#1F2329",
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
  surfaceRaised: "",
  surfacePressed: ""
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
