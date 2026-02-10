import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    listBudgets,
    removeBudget,
    setBudget,
} from "../features/budgets/budgets.repo";
import type { Category } from "../features/categories/category.types";
import { useCategories } from "../features/categories/CategoryProvider";
import { useTheme } from "../theme/useTheme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type BudgetRow = Category & { budget: number | null };

export default function BudgetModal({ visible, onClose }: Props) {
  const theme = useTheme();
  const { categories } = useCategories();

  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const budgets = await listBudgets();
      const budgetMap = new Map(budgets.map(b => [b.categoryId, b.amount]));

      setRows(
        categories.map(c => ({
          ...c,
          budget: budgetMap.get(c.id) ?? null,
        }))
      );
    } catch {
      Alert.alert("Error", "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  function startEdit(row: BudgetRow) {
    setEditingId(row.id);
    setEditValue(row.budget ? (row.budget / 100).toString() : "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveEdit(categoryId: string) {
    const value = Number(editValue);

    if (!editValue.trim() || isNaN(value) || value <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid positive number");
      return;
    }

    try {
      await setBudget(categoryId, Math.round(value * 100));
      await load();
      setEditingId(null);
      setEditValue("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save budget";
      Alert.alert("Error", msg);
    }
  }

  async function handleRemove(categoryId: string, categoryName: string) {
    Alert.alert(
      "Remove budget",
      `Remove the budget for "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeBudget(categoryId);
              await load();
            } catch {
              Alert.alert("Error", "Failed to remove budget");
            }
          },
        },
      ]
    );
  }

  function renderRow({ item }: { item: BudgetRow }) {
    const isEditing = editingId === item.id;

    return (
      <View style={[styles.row, { borderBottomColor: theme.border }]}>
        {/* Icon + Name */}
        <View style={styles.rowLeft}>
          <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
            <Ionicons name={item.icon as any} size={18} color={item.color} />
          </View>
          <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
        </View>

        {/* Budget value or edit input */}
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[
                styles.editInput,
                { color: theme.text, borderColor: theme.primary, backgroundColor: theme.surface },
              ]}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.subtext}
              autoFocus
            />
            <TouchableOpacity onPress={() => saveEdit(item.id)} hitSlop={8}>
              <Ionicons name="checkmark-circle" size={26} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit} hitSlop={8}>
              <Ionicons name="close-circle" size={26} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.valueRow}>
            {item.budget !== null ? (
              <>
                <Text style={[styles.budgetValue, { color: theme.text }]}>
                  ₹{(item.budget / 100).toFixed(0)}
                </Text>
                <TouchableOpacity onPress={() => startEdit(item)} hitSlop={8}>
                  <Ionicons name="pencil" size={16} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(item.id, item.name)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => startEdit(item)}
                style={[styles.setButton, { backgroundColor: theme.primary + "15" }]}
              >
                <Ionicons name="add" size={14} color={theme.primary} />
                <Text style={[styles.setText, { color: theme.primary }]}>Set</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Category Budgets</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Set a monthly spending limit for each category
          </Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : (
            <FlatList
              data={rows}
              keyExtractor={r => r.id}
              renderItem={renderRow}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },

  list: {
    paddingBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryName: {
    fontSize: 15,
    fontWeight: "500",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  budgetValue: {
    fontSize: 15,
    fontWeight: "600",
    marginRight: 2,
  },

  setButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  setText: {
    fontSize: 13,
    fontWeight: "600",
  },

  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  editInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: "600",
    width: 90,
    textAlign: "right",
  },
});
