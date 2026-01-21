import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { initDb } from "../db/init";
import { ExpenseGroup, groupExpensesByDay } from "../features/expenses/expense.group";
import { listExpensesForMonth } from "../features/expenses/expenses.repo";
import { Expense } from "../features/expenses/expenses.types";
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

  useEffect(() => {
    reload();
  }, [year, month]);

  async function reload() {
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
  }

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
    <View style={{ flex: 1, backgroundColor: theme.card }}>
      {/* Month / Year selector */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
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
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>

        <Text
          style={{
            marginHorizontal: 12,
            fontSize: 16,
            fontWeight: "600",
            color: theme.text,
          }}
        >
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
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text}
          />
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
          renderItem={({ item }) => (
            <View
              style={[
                styles.dayCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Date header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    styles.dayHeader,
                    { color: theme.subtext },
                  ]}
                >
                  {item.day}
                </Text>

                <Text
                  style={[
                    styles.dayTotal,
                    { color: theme.text },
                  ]}
                >
                  ₹{(item.total / 100).toFixed(2)}
                </Text>
              </View>


              {/* Expenses of the day */}
              {item.expenses.map((e, index) => (
                <TouchableOpacity
                  key={e.id}
                  onPress={() => setEditing(e)}
                >
                  <View key={e.id}>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Text
                          style={[
                            styles.note,
                            { color: theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {e.note ?? e.categoryId}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.amount,
                          { color: theme.text },
                        ]}
                      >
                        ₹{(e.amount / 100).toFixed(2)}
                      </Text>
                    </View>

                    {/* Divider between rows */}
                    {index < item.expenses.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: theme.border },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
          }

          ListFooterComponent={
            loading ? <ActivityIndicator /> : null
          }
        />
      )}
      {editing && (
        <ExpenseModal
          visible={true}
          expense={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload(); // reload current month
          }}
          onDeleted={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

    </View >
  );
}

const styles = StyleSheet.create({
  dayCard: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },

  dayHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  rowLeft: {
    flex: 1,
    marginRight: 12,
  },

  note: {
    fontSize: 14,
  },

  amount: {
    fontSize: 14,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    marginVertical: 6,
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: 600,
  },

});
