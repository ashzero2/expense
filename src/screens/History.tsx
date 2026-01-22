import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ExpenseCard from "../components/ExpenseCard";
import { initDb } from "../db/init";
import {
  ExpenseGroup,
  groupExpensesByDay,
} from "../features/expenses/expense.group";
import { listExpensesForMonth } from "../features/expenses/expenses.repo";
import type { Expense } from "../features/expenses/expenses.types";
import { useTheme } from "../theme/useTheme";
import ExpenseModal from "./ExpenseModal";

const PAGE_SIZE = 30;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function History() {
  const theme = useTheme();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setOffset(0);
    setHasMore(true);

    await initDb();

    const rows = await listExpensesForMonth(
      year,
      month,
      PAGE_SIZE,
      0
    );

    setGroups(groupExpensesByDay(rows));
    setOffset(rows.length);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  async function loadNextPage() {
    if (!hasMore || loading) return;

    setLoading(true);

    const rows = await listExpensesForMonth(
      year,
      month,
      PAGE_SIZE,
      offset
    );

    setGroups(prev => {
      const all = prev.flatMap(g => g.expenses).concat(rows);
      return groupExpensesByDay(all);
    });

    setOffset(offset + rows.length);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Month selector */}
      <View style={styles.monthBar}>
        <TouchableOpacity
          onPress={() => {
            if (month === 0) {
              setMonth(11);
              setYear(y => y - 1);
            } else {
              setMonth(m => m - 1);
            }
          }}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.monthText, { color: theme.text }]}>
          {MONTHS[month]} {year}
        </Text>

        <TouchableOpacity
          onPress={() => {
            if (month === 11) {
              setMonth(0);
              setYear(y => y + 1);
            } else {
              setMonth(m => m + 1);
            }
          }}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Expense list */}
      {loading && groups.length === 0 ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.day}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.dayCard,
                { backgroundColor: theme.card },
              ]}
            >
              {/* Day header */}
              <View style={styles.dayHeaderRow}>
                <Text style={[styles.dayHeader, { color: theme.text }]}>
                  {item.day}
                </Text>

                <Text style={[styles.dayTotal, { color: theme.subtext }]}>
                  ₹{(item.total / 100).toFixed(2)}
                </Text>
              </View>
              {item.expenses.map(e => (
                <ExpenseCard
                  key={e.id}
                  expense={e}
                  onPress={() => setEditing(e)}
                />
              ))}
            </View>
          )}
          ListFooterComponent={
            loading ? <ActivityIndicator /> : null
          }
        />
      )}

      {editing && (
        <ExpenseModal
          visible
          expense={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
          onDeleted={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  monthBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  monthText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  dayCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 14,
  },

  dayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  dayHeader: {
    fontSize: 15,
    fontWeight: "600",
  },

  dayTotal: {
    fontSize: 14,
  },

  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  expenseMiddle: {
    flex: 1,
    marginRight: 12,
  },

  category: {
    fontSize: 14,
    fontWeight: "500",
  },

  note: {
    fontSize: 13,
    marginTop: 2,
  },

  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
});
