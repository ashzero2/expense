import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ExpenseCard from "../components/ExpenseCard";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const [total, todayExpenses] = await Promise.all([
        getTotalForMonth(now.getFullYear(), now.getMonth()),
        listTodayExpenses(),
      ]);

      setMonthTotal(total);
      setToday(todayExpenses);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleSaved = useCallback(async () => {
    setShowModal(false);
    await loadDashboard();
  }, [loadDashboard]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.subtext }]}>
          This Month
        </Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <Text style={[styles.cardAmount, { color: theme.text }]}>
            ₹ {(monthTotal / 100).toFixed(2)}
          </Text>
        )}
      </View>

      {/* Error state */}
      {error && (
        <View style={[styles.errorCard, { backgroundColor: theme.danger }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadDashboard}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent expenses card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Today
        </Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : today.length === 0 ? (
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
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <ExpenseModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
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
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 14,
  },

  cardAmount: {
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
    fontSize: 14,
    marginTop: 12,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  errorCard: {
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
});
