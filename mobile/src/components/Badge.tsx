import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/theme/tokens";

type BadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
};

const backgroundByTone = {
  neutral: colors.surfaceMuted,
  success: "#eaf7ef",
  warning: "#fff6e8",
  danger: "#fdecec",
  accent: "#ffe8f3",
} as const;

const textByTone = {
  neutral: colors.textMuted,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  accent: colors.primary,
} as const;

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: backgroundByTone[tone] }]}>
      <Text style={[styles.text, { color: textByTone[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
