import { useCallback, useEffect, useState } from "react";
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
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

import { Ionicons } from "@expo/vector-icons";
import MonthPicker from "../components/MonthPicker";
import {
  getLastNMonthTotals,
  getMonthlyCategoryTotals,
  MonthlyCategoryTotal,
  MonthlyTotal,
} from "../features/expenses/expenses.repo";
import { formatCategoryName, MONTHS, PIE_COLORS } from "../shared/config";
import { useMonthNavigation } from "../shared/hooks/useMonthNavigation";
import { useTheme } from "../theme/useTheme";

const screenWidth = Dimensions.get("window").width;

export default function Analytics() {
  const theme = useTheme();
  const { year, month, goToPreviousMonth, goToNextMonth, setMonthAndYear } = useMonthNavigation();

  const [categoryData, setCategoryData] = useState<MonthlyCategoryTotal[]>([]);
  const [trend, setTrend] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    try {
      const [rows, trendRows] = await Promise.all([
        getMonthlyCategoryTotals(year, month),
        getLastNMonthTotals(6),
      ]);

      if (!isCancelled) {
        setCategoryData(rows);
        setTrend(trendRows);
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

  useEffect(() => {
    load();
  }, [load]);

  // Safe chart data - prevent crashes with empty arrays
  const barChartData = {
    labels: categoryData.length > 0 ? categoryData.map(d => formatCategoryName(d.categoryId)) : [""],
    datasets: [{
      data: categoryData.length > 0 ? categoryData.map(d => d.total / 100) : [0],
    }],
  };

  const pieData = categoryData.map((d, index) => ({
    name: formatCategoryName(d.categoryId),
    amount: d.total / 100,
    color: PIE_COLORS[index % PIE_COLORS.length],
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

        {/* Monthly category bar chart */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Monthly Spending by Category
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {loading ? (
            <ActivityIndicator />
          ) : categoryData.length === 0 ? (
            <Text style={{ color: theme.subtext }}>
              No expenses for this month
            </Text>
          ) : (
            <BarChart
              data={barChartData}
              width={screenWidth - 64}
              height={260}
              fromZero
              yAxisLabel="₹"
              yAxisSuffix=""
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
    borderRadius: 999, // pill shape
  },

  monthText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
