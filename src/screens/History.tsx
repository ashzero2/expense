import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import ExpenseCard from "../components/ExpenseCard";
import MonthPicker from "../components/MonthPicker";
import {
  ExpenseGroup,
  groupExpensesByDay,
} from "../features/expenses/expense.group";
import { listExpensesForMonth } from "../features/expenses/expenses.repo";
import type { Expense } from "../features/expenses/expenses.types";
import { MONTHS } from "../shared/config";
import { useMonthNavigation } from "../shared/hooks/useMonthNavigation";
import { useTheme } from "../theme/useTheme";
import ExpenseModal from "./ExpenseModal";

const PAGE_SIZE = 30;

export default function History() {
  const theme = useTheme();
  const { year, month, goToPreviousMonth, goToNextMonth, setMonthAndYear } = useMonthNavigation();

  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setOffset(0);
    setHasMore(true);
    setError(null);

    try {
      const rows = await listExpensesForMonth(year, month, PAGE_SIZE, 0);
      setGroups(groupExpensesByDay(rows));
      setOffset(rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load expenses";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  async function loadNextPage() {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const rows = await listExpensesForMonth(year, month, PAGE_SIZE, offset);

      setGroups(prev => {
        const all = prev.flatMap(g => g.expenses).concat(rows);
        return groupExpensesByDay(all);
      });

      setOffset(o => o + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load more";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Month selector */}
      <View style={styles.monthBar}>
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={[
            styles.monthChip,
            { backgroundColor: theme.card },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthText, { color: theme.text }]}>
            {MONTHS[month]} {year}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.subtext}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <View style={[styles.errorCard, { backgroundColor: theme.danger }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={reload}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expense list */}
      {loading && groups.length === 0 ? (
        <ActivityIndicator style={styles.centered} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.day}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No expenses for this month
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.dayCard, { backgroundColor: theme.card }]}>
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
          ListFooterComponent={loading ? <ActivityIndicator /> : null}
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

      <MonthPicker
        visible={pickerOpen}
        year={year}
        month={month}
        onChange={(y, m) => {
          setMonthAndYear(y, m);
        }}
        onClose={() => setPickerOpen(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  errorCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },

  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 8,
    textDecorationLine: "underline",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },

  monthBar: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
  },

  monthChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999, // pill shape
  },

  monthText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
