import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { listCategories } from "./categories.repo";
import type { Category } from "./category.types";

type CategoryContextValue = {
  categories: Category[];
  getCategory: (id: string) => Category | undefined;
  reload: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextValue>({
  categories: [],
  getCategory: () => undefined,
  reload: async () => {},
});

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    try {
      const rows = await listCategories();
      setCategories(rows);
    } catch {
      // silently fail — db might not be ready yet
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getCategory = useCallback(
    (id: string) => categories.find(c => c.id === id),
    [categories],
  );

  return (
    <CategoryContext.Provider value={{ categories, getCategory, reload: load }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
