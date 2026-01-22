import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

import { initDb } from "../db/init";
import {
  getLastNMonthTotals,
  getMonthlyCategoryTotals,
  MonthlyCategoryTotal,
  MonthlyTotal,
} from "../features/expenses/expenses.repo";
import { useTheme } from "../theme/useTheme";

const screenWidth = Dimensions.get("window").width;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PIE_COLORS = [
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F87171",
  "#A78BFA",
  "#FB923C",
];

export default function Analytics() {
  const theme = useTheme();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [categoryData, setCategoryData] =
    useState<MonthlyCategoryTotal[]>([]);
  const [trend, setTrend] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [year, month]);

  async function load() {
    setLoading(true);
    await initDb();

    const rows = await getMonthlyCategoryTotals(year, month);
    setCategoryData(rows);

    const trendRows = await getLastNMonthTotals(6);
    setTrend(trendRows);

    setLoading(false);
  }

  const barChartData = {
    labels: categoryData.map(d => d.categoryId),
    datasets: [{ data: categoryData.map(d => d.total / 100) }],
  };

  const pieData = categoryData.map((d, index) => ({
    name: d.categoryId,
    amount: d.total,
    color: PIE_COLORS[index % PIE_COLORS.length],
    legendFontColor: theme.text,
    legendFontSize: 12,
  }));

  const lineChartData = {
    labels: trend.map(
      t => `${MONTHS[t.month].slice(0, 3)} ${String(t.year).slice(-2)}`
    ),
    datasets: [{ data: trend.map(t => t.total / 100) }],
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Month selector */}
        <View style={styles.monthBar}>
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
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.monthText, { color: theme.text }]}>
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
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

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
        </View>

        {/* Line chart */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          6-Month Spending Trend
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {trend.length === 0 ? (
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
    paddingBottom: 32,
  },

  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  monthText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
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
});
