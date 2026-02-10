import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MONTHS } from "../shared/config";
import { useTheme } from "../theme/useTheme";

type Props = {
  visible: boolean;
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  onClose: () => void;
};

export default function MonthPicker({
  visible,
  year,
  month,
  onChange,
  onClose,
}: Props) {
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => onChange(year - 1, month)}>
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.yearText, { color: theme.text }]}>
              {year}
            </Text>

            <TouchableOpacity onPress={() => onChange(year + 1, month)}>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {MONTHS.map((m, idx) => {
              const active = idx === month;

              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.month,
                    {
                      backgroundColor: active
                        ? theme.primary
                        : theme.surfaceRaised,
                    },
                  ]}
                  onPress={() => onChange(year, idx)}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : theme.text,
                      fontWeight: "500",
                    }}
                  >
                    {m.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.done, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  month: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  done: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  yearText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
  },
});
