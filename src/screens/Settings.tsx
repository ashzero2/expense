
import {
  documentDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { Alert, Text, TouchableOpacity, View } from "react-native";

import { clearAllExpenses } from "../db/admin";
import { initDb } from "../db/init";
import { exportExpensesCsv } from "../features/expenses/expenses.export";
import { useTheme } from "../theme/useTheme";

export default function SettingsScreen() {
  const theme = useTheme();


  async function handleExport() {
    await initDb();

    const csv = await exportExpensesCsv();

    if (!documentDirectory) {
      throw new Error("Document directory not available");
    }

    const path = documentDirectory + "expenses.csv";

    await writeAsStringAsync(path, csv, {
      encoding: "utf8",
    });

    await Sharing.shareAsync(path, {
      mimeType: "text/csv",
      dialogTitle: "Export expenses",
    });
  }

  function confirmClear() {
    Alert.alert(
      "Clear all data",
      "This will permanently delete all expenses and categories.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await initDb();
            await clearAllExpenses();
          },
        },
      ]
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: theme.card,
      }}
    >
      {/* Export */}
      <TouchableOpacity
        onPress={handleExport}
        style={{ paddingVertical: 16 }}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Export data as CSV
        </Text>
      </TouchableOpacity>

      <View
        style={{
          height: 1,
          backgroundColor: theme.border,
          marginVertical: 16,
        }}
      />

      {/* Danger zone */}
      <Text
        style={{
          color: theme.subtext,
          marginBottom: 8,
        }}
      >
        Danger zone
      </Text>

      <TouchableOpacity
        onPress={confirmClear}
        style={{ paddingVertical: 16 }}
      >
        <Text
          style={{
            color: "#EF4444",
            fontSize: 16,
          }}
        >
          Clear all data
        </Text>
      </TouchableOpacity>

      <View
        style={{
          height: 1,
          backgroundColor: theme.border,
          marginVertical: 16,
        }}
      />

      {/* App info */}
      <Text style={{ color: theme.subtext }}>
        Version 1.0.0
      </Text>
    </View>
  );
}
