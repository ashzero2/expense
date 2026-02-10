import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createCategory } from "../features/categories/categories.repo";
import type { Category } from "../features/categories/category.types";
import { useTheme } from "../theme/useTheme";

const ICONS = [
  "restaurant",
  "cafe",
  "cart",
  "car",
  "bus",
  "film",
  "game-controller",
  "musical-notes",
  "fitness",
  "medkit",
  "gift",
  "wallet",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function AddCategoryModal({
  visible,
  onClose,
  onSaved,
}: Props) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function generateColor(input: string): string {
    const colors = [
      "#E06C75",
      "#98C379",
      "#E5C07B",
      "#61AFEF",
      "#C678DD",
      "#56B6C2",
    ];

    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  function slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a category name");
      return;
    }

    if (!icon) {
      Alert.alert("Icon required", "Please select an icon");
      return;
    }

    setSaving(true);

    const category: Category = {
      id: slugify(name),
      name: name.trim(),
      icon,
      color: generateColor(name),
      createdAt: Date.now(),
      isSystem: false
    };

    try {
      await createCategory(category);
      onSaved();
      onClose();
      setName("");
      setIcon(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Category already exists";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Add category
          </Text>

          {/* Name */}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            placeholderTextColor={theme.subtext}
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />

          {/* Icon picker */}
          <Text style={[styles.label, { color: theme.subtext }]}>
            Icon
          </Text>

          <View style={styles.iconGrid}>
            {ICONS.map(i => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      icon === i ? theme.primary : theme.background,
                  },
                ]}
                onPress={() => setIcon(i)}
              >
                <Ionicons
                  name={i as any}
                  size={22}
                  color={icon === i ? "#fff" : theme.text}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: theme.subtext }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={save} disabled={saving}>
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: "600",
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    marginBottom: 8,
  },

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
