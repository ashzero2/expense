import { useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "./colors";
import type { Theme } from "./theme";

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}
