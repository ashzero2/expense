import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { randomUUID } from "expo-crypto";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCategories } from "../features/categories/CategoryProvider";
import { createExpense, deleteExpense, updateExpense } from "../features/expenses/expenses.repo";
import { Expense } from "../features/expenses/expenses.types";
import { Theme } from "../theme/theme";
import { useTheme } from "../theme/useTheme";

type Props = {
  visible: boolean;
  expense?: Expense; // undefined = create
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
};

export default function ExpenseModal({
  visible,
  expense,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyleSheet(theme), [theme]);
  const { categories: allCategories } = useCategories();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    if (expense) {
      setAmount((expense.amount / 100).toString());
      setNote(expense.note ?? "");
      setCategoryId(expense.categoryId);
      setDate(new Date(expense.occurredAt));
    } else {
      setAmount("");
      setNote("");
      setCategoryId(null);
      setDate(new Date());
    }
    setValidationError(null);
  }, [visible, expense]);

  function validate(): boolean {
    const value = Math.round(Number(amount) * 100);

    if (!amount.trim()) {
      setValidationError("Please enter an amount");
      return false;
    }

    if (isNaN(value) || value <= 0) {
      setValidationError("Please enter a valid positive amount");
      return false;
    }

    if (!categoryId) {
      setValidationError("Please select a category");
      return false;
    }

    setValidationError(null);
    return true;
  }

  async function save() {
    if (!validate()) return;

    setSaving(true);

    try {
      const value = Math.round(Number(amount) * 100);
      const occurredAt = date.getTime();

      if (expense) {
        await updateExpense(expense.id, {
          amount: value,
          categoryId: categoryId!,
          note: note.trim() || null,
          occurredAt,
        });
      } else {
        const now = Date.now();
        await createExpense({
          id: randomUUID(),
          amount: value,
          categoryId: categoryId!,
          note: note.trim() || null,
          occurredAt,
          createdAt: now,
          updatedAt: now,
        });
      }

      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save expense";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;

    Alert.alert(
      "Delete expense",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              onDeleted?.();
            } catch {
              Alert.alert("Error", "Failed to delete expense");
            }
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.backdrop}
      >
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {expense ? "Edit Expense" : "Add Expense"}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={saving} hitSlop={8}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* Validation Error */}
          {validationError && (
            <View style={[styles.errorBanner, { backgroundColor: theme.danger + "18" }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorBannerText, { color: theme.danger }]}>{validationError}</Text>
            </View>
          )}

          {/* Amount */}
          <View style={styles.section}>
            <View style={styles.label}>
              <Ionicons name="cash-outline" size={16} color={theme.subtext} />
              <Text style={[styles.labelText, { color: theme.subtext }]}>Amount</Text>
            </View>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={theme.subtext}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={text => {
                setAmount(text);
                setValidationError(null);
              }}
              style={[
                styles.amountInput,
                {
                  color: theme.text,
                  borderColor: validationError && !amount.trim() ? theme.danger : theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <View style={styles.label}>
              <Ionicons name="pricetag-outline" size={16} color={theme.subtext} />
              <Text style={[styles.labelText, { color: theme.subtext }]}>Category</Text>
            </View>
            <View style={styles.categoryWrap}>
              {allCategories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    setCategoryId(c.id);
                    setValidationError(null);
                  }}
                  style={[
                    styles.category,
                    {
                      borderColor: categoryId === c.id ? theme.primary : theme.border,
                      backgroundColor: categoryId === c.id ? theme.primary + "20" : theme.surface,
                    },
                  ]}
                >
                  <Text style={{
                    color: categoryId === c.id ? theme.primary : theme.text,
                    fontSize: 13,
                    fontWeight: categoryId === c.id ? "600" : "400",
                  }}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <View style={styles.label}>
              <Ionicons name="calendar-outline" size={16} color={theme.subtext} />
              <Text style={[styles.labelText, { color: theme.subtext }]}>Date</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
            >
              <Text style={{ color: theme.text }}>{date.toDateString()}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <View style={styles.label}>
              <Ionicons name="create-outline" size={16} color={theme.subtext} />
              <Text style={[styles.labelText, { color: theme.subtext }]}>Note</Text>
            </View>
            <TextInput
              placeholder="Add a note..."
              placeholderTextColor={theme.subtext}
              value={note}
              onChangeText={setNote}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {expense && (
              <TouchableOpacity
                onPress={handleDelete}
                disabled={saving}
                style={[styles.deleteButton, { borderColor: theme.danger }]}
              >
                <Ionicons name="trash-outline" size={16} color={theme.danger} />
                <Text style={{ color: theme.danger, fontWeight: "500" }}>Delete</Text>
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
              style={[styles.cancelButton]}
            >
              <Text style={{ color: theme.subtext, fontWeight: "500" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={save}
              disabled={saving}
              style={[styles.saveButton, { backgroundColor: saving ? theme.subtext : theme.primary }]}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
    </Modal>
  );
}

function createStyleSheet(theme: Theme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.55)",
    },

    container: {
      padding: 20,
      paddingBottom: 32,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
    },

    section: {
      marginBottom: 16,
    },

    label: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },

    labelText: {
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
    },

    categoryWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    category: {
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },

    dateButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
    },

    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },

    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },

    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
    },

    saveButton: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 15,
    },

    amountInput: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      fontSize: 22,
      fontWeight: "600",
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      borderRadius: 10,
      marginBottom: 16,
    },

    errorBannerText: {
      fontSize: 13,
      fontWeight: "500",
    },
  });
}