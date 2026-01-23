export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PIE_COLORS = [
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F87171",
  "#A78BFA",
  "#FB923C",
];

export const CURRENCY_SYMBOL = "₹";

/**
 * Formats a category ID to a display name
 * e.g., "food" -> "Food", "entertainment" -> "Entertainment"
 */
export function formatCategoryName(categoryId: string): string {
  if (!categoryId) return "";
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1).toLowerCase();
}