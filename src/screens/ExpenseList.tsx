import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";

import { initDb } from "../db/init";
import type { ExpenseGroup } from "../features/expenses/expense.group";
import { groupExpensesByDay } from "../features/expenses/expense.group";
import { listExpenses } from "../features/expenses/expenses.repo";

const PAGE_SIZE = 30;

export default function ExpenseListScreen() {
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNextPage();
  }, []);

  async function loadNextPage() {
    if (!hasMore) return;

    setLoading(true);

    await initDb();
    const rows = await listExpenses(PAGE_SIZE, offset);

    if (rows.length < PAGE_SIZE) {
      setHasMore(false);
    }

    const nextOffset = offset + rows.length;
    setOffset(nextOffset);

    setGroups(prev => {
      const all = prev.flatMap(g => g.expenses).concat(rows);
      return groupExpensesByDay(all);
    });

    setLoading(false);
  }

  if (loading && groups.length === 0) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={groups}
      keyExtractor={item => item.day}
      onEndReached={loadNextPage}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <View>
          <Text>{item.day}</Text>
          <Text>Total: ₹{(item.total / 100).toFixed(2)}</Text>

          {item.expenses.map(e => (
            <View key={e.id}>
              <Text>₹{(e.amount / 100).toFixed(2)}</Text>
              {e.note && <Text>{e.note}</Text>}
            </View>
          ))}
        </View>
      )}
      ListFooterComponent={
        loading ? <ActivityIndicator /> : null
      }
    />
  );
}
