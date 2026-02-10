import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteCategory, listCategories } from "../features/categories/categories.repo";
import type { Category } from "../features/categories/category.types";
import { useCategories } from "../features/categories/CategoryProvider";
import { useTheme } from "../theme/useTheme";
import AddCategoryModal from "./AddCategoryModal";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CategoryModal({ visible, onClose }: Props) {
  const theme = useTheme();
  const { reload: reloadGlobalCategories } = useCategories();
  const [categories, setCategories] = useState<Category[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      load();
    }
  }, [visible]);

  async function load() {
    try {
      const rows = await listCategories();
      setCategories(rows);
    } catch {
      Alert.alert("Error", "Failed to load categories");
    }
  }

  function confirmDelete(category: Category) {
    Alert.alert(
      "Delete category",
      `Delete "${category.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              load();
              reloadGlobalCategories();
            } catch (err) {
              const message = err instanceof Error ? err.message : "Failed to delete";
              Alert.alert("Cannot delete", message);
            }
          },
        },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Categories
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView>
            {categories.map(cat => (
              <View key={cat.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: cat.color },
                    ]}
                  />
                  <Ionicons
                    name={cat.icon as any}
                    size={18}
                    color={cat.color}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: theme.text, fontSize: 15 }}>
                    {cat.name}
                  </Text>
                </View>

                {cat.isSystem ? (
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={theme.subtext}
                  />
                ) : (
                  <TouchableOpacity onPress={() => confirmDelete(cat)}>
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={theme.danger}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.border }]}
            onPress={() => setAddOpen(true)}
          >
            <Ionicons name="add" size={18} color={theme.primary} />
            <Text style={{ color: theme.primary, fontWeight: "600" }}>
              Add category
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AddCategoryModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          load();
          reloadGlobalCategories();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  addButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
});
