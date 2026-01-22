import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Expense } from "../features/expenses/expenses.types";
import { CATEGORY_ICONS, getCategoryColor } from "../theme/categoryColors";
import { useTheme } from "../theme/useTheme";

type Props = {
  expense: Expense;
  onPress?: (expense: Expense) => void;
  showCategory?: boolean; // optional for reuse
};

export default function ExpenseCard({
  expense,
  onPress,
  showCategory = true,
}: Props) {
  const theme = useTheme();
  const colors = getCategoryColor(expense.categoryId);

  const Content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surfaceRaised },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconWrap
        ]}
      >
        <Ionicons
          name={
            CATEGORY_ICONS[expense.categoryId] ??
            CATEGORY_ICONS.default
          }
          size={16}
          color={colors.base}
        />
      </View>

      {/* Middle */}
      <View style={styles.middle}>
        {showCategory && (
          <Text style={[styles.category, { color: theme.text }]}>
            {expense.categoryId}
          </Text>
        )}

        {expense.note && (
          <Text
            style={[styles.note, { color: theme.subtext }]}
            numberOfLines={1}
          >
            {expense.note}
          </Text>
        )}
      </View>

      {/* Amount */}
      <Text style={[styles.amount, { color: theme.text }]}>
        ₹{(expense.amount / 100).toFixed(2)}
      </Text>
    </View>
  );

  if (!onPress) return Content;

  return (
    <TouchableOpacity
      onPress={() => onPress(expense)}
      activeOpacity={0.7}
    >
      {Content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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

  middle: {
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
