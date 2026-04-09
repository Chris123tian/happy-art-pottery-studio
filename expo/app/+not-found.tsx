import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { FileQuestion } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container} testID="not-found-screen">
        <FileQuestion color={theme.colors.primary} size={64} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>The page you&apos;re looking for doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.white,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: theme.colors.secondary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.white,
  },
});
