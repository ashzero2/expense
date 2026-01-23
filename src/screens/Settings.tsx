
import {
  documentDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { clearAllExpenses } from "../db/admin";
import { exportExpensesCsv } from "../features/expenses/expenses.export";
import { useTheme } from "../theme/useTheme";

export default function SettingsScreen() {
  const theme = useTheme();

  async function handleExport() {
    try {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export data";
      Alert.alert("Export Failed", message);
    }
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
            try {
              await clearAllExpenses();
              Alert.alert("Success", "All data has been cleared");
            } catch {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* DATA */}
      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>
        Data
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card },
        ]}
      >
        <TouchableOpacity style={styles.row} onPress={handleExport}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="download-outline"
              size={18}
              color={theme.primary}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>
              Export data as CSV
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.subtext}
          />
        </TouchableOpacity>
      </View>

      {/* DANGER */}
      <Text
        style={[
          styles.sectionLabel,
          { color: theme.danger, marginTop: 24 },
        ]}
      >
        Danger zone
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card },
        ]}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            confirmClear();
          }}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.danger}
            />
            <Text
              style={[
                styles.rowText,
                { color: theme.danger },
              ]}
            >
              Clear all data
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* VERSION */}
      <Text
        style={[
          styles.version,
          { color: theme.subtext },
        ]}
      >
        Version 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  card: {
    borderRadius: 12,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rowText: {
    fontSize: 15,
    fontWeight: "500",
  },

  version: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 13,
  },
});