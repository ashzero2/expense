import { Ionicons } from "@expo/vector-icons";
import { palette } from "./colors";
import { adjustHex } from "./colorUtils";

export const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: "fast-food-outline",
  groceries: "bag-handle-outline",
  transport: "car-outline",
  shopping: "bag-outline",
  entertainment: "game-controller-outline",
  default: "ellipsis-horizontal-outline",
};

export const CATEGORY_COLOR_POOL = [
  palette.blue,
  palette.green,
  palette.yellow,
  palette.red,
  palette.purple,
  palette.teal,
];

export function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // force 32-bit
  }

  return Math.abs(hash);
}

export function getCategoryColor(categoryId: string) {
  const index =
    hashString(categoryId) % CATEGORY_COLOR_POOL.length;

  const base = CATEGORY_COLOR_POOL[index];

  return {
    base,
    bg: adjustHex(base, -20),   // icon background
    text: "#FFFFFF",
  };
}
