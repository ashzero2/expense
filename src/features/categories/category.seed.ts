import type { Category } from "./category.types";

const now = Date.now();

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food",
    color: "#EF4444",
    icon: "restaurant",
    createdAt: now,
  },
  {
    id: "transport",
    name: "Transport",
    color: "#3B82F6",
    icon: "car",
    createdAt: now,
  },
  {
    id: "groceries",
    name: "Groceries",
    color: "#10B981",
    icon: "cart",
    createdAt: now,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    color: "#A855F7",
    icon: "film",
    createdAt: now,
  },
  {
    id: "others",
    name: "Others",
    color: "#A855F7",
    icon: "film",
    createdAt: now,
  },
];
