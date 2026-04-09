import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "@/constants/theme";
import { X } from "lucide-react-native";

export default function ModalScreen() {
  return (
    <Pressable style={styles.overlay} onPress={() => router.back()} testID="modal-overlay">
      <View style={styles.modalContent} testID="modal-content">
        <View style={styles.modalHeader}>
          <Text style={styles.title}>Happy Art</Text>
          <TouchableOpacity onPress={() => router.back()} testID="modal-close">
            <X color={theme.colors.text} size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>
          Welcome to Happy Art Pottery Studio! Explore our classes, events, and gallery.
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
          testID="modal-close-button"
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    minWidth: 300,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: theme.colors.secondary,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    color: theme.colors.textLight,
    lineHeight: 22,
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  closeButtonText: {
    color: theme.colors.white,
    fontWeight: "600" as const,
    fontSize: 16,
  },
});
