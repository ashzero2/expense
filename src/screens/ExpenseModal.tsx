import DateTimePicker from "@react-native-community/datetimepicker";
import { randomUUID } from "expo-crypto";
import { useEffect, useState } from "react";
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

import { listCategories } from "../features/categories/categories.repo";
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
  const styles = createStyleSheet(theme);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!visible) return;

    listCategories().then(cats =>
      setCategories(
        cats.map(c => ({ id: c.id, name: c.name }))
      )
    );

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
  }, [visible, expense]);

  async function save() {
    const value = Math.round(Number(amount) * 100);
    if (!value || value <= 0 || !categoryId) return;

    const occurredAt = date.getTime();

    if (expense) {
      await updateExpense(expense.id, {
        amount: value,
        categoryId,
        note: note.trim() || null,
        occurredAt,
      });
    } else {
      const now = Date.now();

      await createExpense({
        id: randomUUID(),
        amount: value,
        categoryId,
        note: note.trim() || null,
        occurredAt,
        createdAt: now,
        updatedAt: now,
      });
    }

    onSaved();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            Add Expense
          </Text>

          {/* Amount */}
          <TextInput
            placeholder="69 Rs"
            placeholderTextColor={theme.subtext}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={[
              styles.amountInput,
              { color: theme.text, borderColor: theme.border },
            ]}
          />

          {/* Category */}
          <View style={styles.categoryWrap}>
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[
                  styles.category,
                  {
                    borderColor:
                      categoryId === c.id
                        ? theme.primary
                        : theme.border,
                  },
                ]}
              >
                <Text style={{ color: theme.text }}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.input,
              {
                justifyContent: "center",
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={{ color: theme.text }}>
              {date.toDateString()}
            </Text>
          </TouchableOpacity>


          {/* Note */}
          <TextInput
            placeholder="Note (optional)"
            placeholderTextColor={theme.subtext}
            value={note}
            onChangeText={setNote}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border },
            ]}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: theme.subtext }}>Cancel</Text>
            </TouchableOpacity>

            {expense && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete expense",
                    "This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          await deleteExpense(expense.id);
                          onDeleted?.();
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={{ color: "#EF4444" }}>
                  Delete expense
                </Text>
              </TouchableOpacity>
            )}


            <TouchableOpacity onPress={save}>
              <Text style={{ color: theme.primary }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
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
      backgroundColor: theme.card
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
    subtitle: {
      fontSize: 13,
      marginBottom: 16
    },
    amountInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 16
    }
  });
}