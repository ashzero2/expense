import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { ExpenseGroup } from "../features/expenses/expense.group";
import { groupExpensesByDay } from "../features/expenses/expense.group";
import { listExpenses } from "../features/expenses/expenses.repo";
import { useTheme } from "../theme/useTheme";

const PAGE_SIZE = 30;

export default function ExpenseListScreen() {
  const theme = useTheme();
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const rows = await listExpenses(PAGE_SIZE, offset);

      if (rows.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setOffset(prev => prev + rows.length);

      setGroups(prev => {
        const all = prev.flatMap(g => g.expenses).concat(rows);
        return groupExpensesByDay(all);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load expenses";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, offset]);

  useEffect(() => {
    // Initial load
    const initialLoad = async () => {
      setLoading(true);
      try {
        const rows = await listExpenses(PAGE_SIZE, 0);
        setGroups(groupExpensesByDay(rows));
        setOffset(rows.length);
        setHasMore(rows.length === PAGE_SIZE);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load expenses";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  if (loading && groups.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && groups.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.list}
      data={groups}
      keyExtractor={item => item.day}
      onEndReached={loadNextPage}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.day, { color: theme.text }]}>{item.day}</Text>
          <Text style={[styles.total, { color: theme.subtext }]}>
            Total: ₹{(item.total / 100).toFixed(2)}
          </Text>

          {item.expenses.map(e => (
            <View key={e.id} style={styles.expense}>
              <Text style={{ color: theme.text }}>
                ₹{(e.amount / 100).toFixed(2)}
              </Text>
              {e.note && (
                <Text style={{ color: theme.subtext }}>{e.note}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    padding: 16,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  day: {
    fontSize: 16,
    fontWeight: "600",
  },

  total: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },

  expense: {
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#3E4451",
  },
});
