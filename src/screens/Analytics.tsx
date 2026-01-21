import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

import { Ionicons } from "@expo/vector-icons";
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
  "#60A5FA", // blue
  "#34D399", // green
  "#FBBF24", // yellow
  "#F87171", // red
  "#A78BFA", // purple
  "#FB923C", // orange
];

export default function Analytics() {
  const theme = useTheme();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [trend, setTrend] = useState<MonthlyTotal[]>([]);

  const [data, setData] = useState<MonthlyCategoryTotal[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    load();
  }, [year, month]);

  async function load() {
    setLoading(true);
    await initDb();

    const rows = await getMonthlyCategoryTotals(year, month);
    setData(rows);

    const trendRows = await getLastNMonthTotals(6);
    setTrend(trendRows);

    setLoading(false);
  }

  const trendLabels = trend.map(t =>
    `${MONTHS[t.month].slice(0, 3)} ${String(t.year).slice(-2)}`
  );

  const trendValues = trend.map(t => t.total / 100);

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        data: trendValues,
        strokeWidth: 2,
      },
    ],
  };

  const labels = data.map(d => d.categoryId);
  const values = data.map(d => d.total / 100); // cents → currency

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
      },
    ],
  };
  const pieData = data.map((d, index) => ({
    name: d.categoryId,
    amount: d.total,
    color: PIE_COLORS[index % PIE_COLORS.length],
    legendFontColor: theme.text,
    legendFontSize: 12,
  }));


  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
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
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>

        <Text
          style={{
            marginHorizontal: 12,
            fontSize: 16,
            fontWeight: 600,
            color: theme.text,
          }}
        >
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
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: theme.text,
          marginBottom: 12,
        }}
      >
        Monthly Spending by Category
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : data.length === 0 ? (
        <Text style={{ color: theme.subtext }}>
          No expenses for this month
        </Text>
      ) : (
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={280}
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
          style={{ borderRadius: 12 }}
        />
      )}

      <Text
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: theme.text,
          marginTop: 24,
          marginBottom: 12,
        }}
      >
        Spending Share
      </Text>

      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="16"
        center={[0, 0]}
        absolute
        chartConfig={{
          color: () => theme.text,
        }}
      />

      <Text
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: theme.text,
          marginTop: 24,
          marginBottom: 12,
        }}
      >
        6-Month Spending Trend
      </Text>

      {trend.length === 0 ? (
        <Text style={{ color: theme.subtext }}>
          Not enough data yet
        </Text>
      ) : (
        <LineChart
          data={trendData}
          width={screenWidth - 32}
          height={220}
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
          bezier
          style={{
            borderRadius: 12,
          }}
        />
      )}


    </View>
  );

}