import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ExpenseCard from "../components/ExpenseCard";
import { initDb } from "../db/init";
import {
  getTotalForMonth,
  listTodayExpenses,
} from "../features/expenses/expenses.repo";
import type { Expense } from "../features/expenses/expenses.types";
import { useTheme } from "../theme/useTheme";
import ExpenseModal from "./ExpenseModal";

export default function DashboardScreen() {
  const theme = useTheme();
  const [monthTotal, setMonthTotal] = useState(0);
  const [today, setToday] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  async function loadDashboard() {
    await initDb();

    const now = new Date();

    const total = await getTotalForMonth(
      now.getFullYear(),
      now.getMonth()
    );

    const todayExpenses = await listTodayExpenses();

    setMonthTotal(total);
    setToday(todayExpenses);
  }


  return (
    <View style={styles.container}>
      {/* Top card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={styles.cardTitle}>This Month</Text>
        <Text style={styles.cardAmount}>
          ₹ {(monthTotal / 100).toFixed(2)}
        </Text>
      </View>

      {/* Recent expenses card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Today
        </Text>

        {today.length === 0 ? (
          <Text style={[styles.empty, { color: theme.subtext }]}>
            No expenses today
          </Text>
        ) : (
          today.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPress={() => setEditing(expense)}
            />
          ))
        )}
      </View>


      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <ExpenseModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSaved={async () => {
          setShowModal(false);

          // refresh dashboard data
          const now = new Date();
          setMonthTotal(
            await getTotalForMonth(now.getFullYear(), now.getMonth())
          );
          setToday(await listTodayExpenses());
        }}
      />
      {editing && (
        <ExpenseModal
          visible
          expense={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadDashboard();
          }}
          onDeleted={() => {
            setEditing(null);
            loadDashboard();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },

  cardTitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },

  cardAmount: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  empty: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 12,
  },

  row: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  amount: {
    fontSize: 16,
    fontWeight: "500",
  },

  note: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20, // ABOVE bottom bar
    backgroundColor: "#111827",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },

  expenseLeft: {
    flex: 1,
    marginRight: 12,
  },

  category: {
    fontSize: 15,
    fontWeight: "500",
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  expenseMiddle: {
    flex: 1,
    marginRight: 12,
  },
});
