export type Expense = {
  id: string;
  amount: number;
  categoryId: string;
  note: string | null;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
};