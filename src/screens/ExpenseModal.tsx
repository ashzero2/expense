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
          <Text style={[styles.title, { color: theme.text }]}>
            {expense ? "Edit Expense" : "Add Expense"}
          </Text>

          {/* Validation Error */}
          {validationError && (
            <View style={[styles.errorBanner, { backgroundColor: theme.danger }]}>
              <Text style={styles.errorBannerText}>{validationError}</Text>
            </View>
          )}

          {/* Amount */}
          <TextInput
            placeholder="Amount (₹)"
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
              },
            ]}
          />

          {/* Category */}
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
                    backgroundColor: categoryId === c.id ? theme.primary + "20" : "transparent",
                  },
                ]}
              >
                <Text style={{ color: categoryId === c.id ? theme.primary : theme.text }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { justifyContent: "center", borderColor: theme.border }]}
          >
            <Text style={{ color: theme.text }}>{date.toDateString()}</Text>
          </TouchableOpacity>

          {/* Note */}
          <TextInput
            placeholder="Note (optional)"
            placeholderTextColor={theme.subtext}
            value={note}
            onChangeText={setNote}
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} disabled={saving}>
              <Text style={{ color: theme.subtext }}>Cancel</Text>
            </TouchableOpacity>

            {expense && (
              <TouchableOpacity onPress={handleDelete} disabled={saving}>
                <Text style={{ color: theme.danger }}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={save} disabled={saving}>
              <Text style={{ color: saving ? theme.subtext : theme.primary }}>
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
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },

    title: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
    },

    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },

    categoryWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },

    category: {
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },

    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },

    amountInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 16,
    },

    errorBanner: {
      padding: 10,
      borderRadius: 8,
      marginBottom: 12,
    },

    errorBannerText: {
      color: "#FFFFFF",
      fontSize: 13,
      textAlign: "center",
    },
  });
}