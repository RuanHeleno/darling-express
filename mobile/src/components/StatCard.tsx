import { Text, View, StyleSheet } from "react-native";
import { colors, radii, spacing } from "@/theme/tokens";

type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneBackground = {
  default: colors.surface,
  success: "#eaf7ef",
  warning: "#fff6e8",
  danger: "#fdecec",
} as const;

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: toneBackground[tone] }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    minHeight: 96,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: "700",
  },
});
