import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

import { Ionicons } from "@expo/vector-icons";
import MonthPicker from "../components/MonthPicker";
import type { Budget } from "../features/budgets/budget.types";
import { listBudgets } from "../features/budgets/budgets.repo";
import { useCategories } from "../features/categories/CategoryProvider";
import {
  getLastNMonthTotals,
  getMonthlyCategoryTotals,
  MonthlyCategoryTotal,
  MonthlyTotal,
} from "../features/expenses/expenses.repo";
import { MONTHS, PIE_COLORS } from "../shared/config";
import { useMonthNavigation } from "../shared/hooks/useMonthNavigation";
import { useTheme } from "../theme/useTheme";

const screenWidth = Dimensions.get("window").width;
const BUDGET_CARD_GAP = 10;
const BUDGET_CARD_WIDTH = (screenWidth - 32 - BUDGET_CARD_GAP) / 2; // 32 = scroll padding (16*2)

export default function Analytics() {
  const theme = useTheme();
  const { year, month, setMonthAndYear } = useMonthNavigation();
  const { getCategory } = useCategories();

  const [categoryData, setCategoryData] = useState<MonthlyCategoryTotal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [trend, setTrend] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    try {
      const [rows, trendRows, budgetRows] = await Promise.all([
        getMonthlyCategoryTotals(year, month),
        getLastNMonthTotals(6),
        listBudgets(),
      ]);

      if (!isCancelled) {
        setCategoryData(rows);
        setTrend(trendRows);
        setBudgets(budgetRows);
      }
    } catch (err) {
      if (!isCancelled) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        Alert.alert("Error", message);
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Helper: resolve category name from context, fall back to ID
  const getCategoryName = (id: string) => getCategory(id)?.name ?? id;

  // Build budget vs spending rows — only categories that have a budget set
  const budgetRows = (() => {
    const spentMap = new Map(categoryData.map(d => [d.categoryId, d.total]));

    return budgets
      .map(b => {
        const cat = getCategory(b.categoryId);
        const spent = spentMap.get(b.categoryId) ?? 0;

        return {
          id: b.categoryId,
          name: cat?.name ?? b.categoryId,
          icon: cat?.icon ?? "ellipsis-horizontal-outline",
          color: cat?.color ?? "#888",
          budget: b.amount,
          spent,
          overBudget: spent > b.amount,
          percentage: Math.min((spent / b.amount) * 100, 100),
        };
      })
      .sort((a, b) => b.spent - a.spent);
  })();

  const pieData = categoryData.map((d, index) => ({
    name: getCategoryName(d.categoryId),
    amount: d.total / 100,
    color: getCategory(d.categoryId)?.color ?? PIE_COLORS[index % PIE_COLORS.length],
    legendFontColor: theme.text,
    legendFontSize: 12,
  }));

  const lineChartData = {
    labels: trend.length > 0
      ? trend.map(t => `${MONTHS[t.month].slice(0, 3)} ${String(t.year).slice(-2)}`)
      : [""],
    datasets: [{
      data: trend.length > 0 ? trend.map(t => t.total / 100) : [0],
    }],
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
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

        {error && (
          <View style={[styles.errorCard, { backgroundColor: theme.danger }]}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Budget vs Spending */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Budget vs Spending
        </Text>

        {loading ? (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <ActivityIndicator />
          </View>
        ) : budgetRows.length === 0 ? (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={32} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                No budgets set yet
              </Text>
              <Text style={[styles.emptyHint, { color: theme.subtext }]}>
                Go to Settings → Manage budgets to set spending limits
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.budgetGrid}>
            {budgetRows.map(row => {
              const progressColor = row.overBudget ? theme.danger : theme.primary;
              const ratio = row.spent / row.budget;
              const percentLabel = `${Math.round(ratio * 100)}%`;

              return (
                <View
                  key={row.id}
                  style={[
                    styles.budgetCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: row.overBudget ? theme.danger + "40" : theme.border,
                    },
                  ]}
                >
                  {/* Top: icon + name */}
                  <View style={styles.budgetCardTop}>
                    <View style={[styles.iconDot, { backgroundColor: row.color + "20" }]}>
                      <Ionicons name={row.icon as any} size={16} color={row.color} />
                    </View>
                    <Text
                      style={[styles.budgetName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {row.name}
                    </Text>
                  </View>

                  {/* Amounts */}
                  <View style={styles.budgetAmounts}>
                    <Text
                      style={[
                        styles.budgetSpent,
                        { color: row.overBudget ? theme.danger : theme.text },
                      ]}
                    >
                      ₹{(row.spent / 100).toFixed(0)}
                    </Text>
                    <Text style={[styles.budgetLimit, { color: theme.subtext }]}>
                      / ₹{(row.budget / 100).toFixed(0)}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressWrap}>
                    <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: progressColor,
                            width: `${Math.min(ratio * 100, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.percentText,
                        { color: row.overBudget ? theme.danger : theme.subtext },
                      ]}
                    >
                      {percentLabel}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Pie chart */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Spending Share
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {loading ? (
            <ActivityIndicator />
          ) : categoryData.length === 0 ? (
            <Text style={{ color: theme.subtext }}>
              No data to display
            </Text>
          ) : (
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={220}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="16"
              absolute
              chartConfig={{
                color: () => theme.text,
              }}
            />
          )}
        </View>

        {/* Line chart */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          6-Month Spending Trend
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {loading ? (
            <ActivityIndicator />
          ) : trend.length === 0 ? (
            <Text style={{ color: theme.subtext }}>
              Not enough data yet
            </Text>
          ) : (
            <LineChart
              data={lineChartData}
              width={screenWidth - 64}
              height={220}
              fromZero
              yAxisLabel="₹"
              yAxisSuffix=""
              bezier
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: () => theme.primary,
                labelColor: () => theme.subtext,
                propsForBackgroundLines: {
                  stroke: theme.border,
                },
              }}
              style={{ borderRadius: 8 }}
            />
          )}
        </View>

        <MonthPicker
          visible={pickerOpen}
          year={year}
          month={month}
          onChange={(y, m) => {
            setMonthAndYear(y, m);
          }}
          onClose={() => setPickerOpen(false)}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  scroll: {
    padding: 16,
    paddingTop: 3,
    paddingBottom: 32,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    borderRadius: 999,
  },

  monthText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Budget card grid styles
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },

  emptyHint: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  budgetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: BUDGET_CARD_GAP,
    marginBottom: 24,
  },

  budgetCard: {
    width: BUDGET_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },

  budgetCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  iconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  budgetName: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  budgetAmounts: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginBottom: 8,
  },

  budgetSpent: {
    fontSize: 17,
    fontWeight: "700",
  },

  budgetLimit: {
    fontSize: 11,
    fontWeight: "400",
  },

  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  percentText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "right",
  },
});
