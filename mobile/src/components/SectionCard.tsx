import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/theme/tokens";

type SectionCardProps = PropsWithChildren<{
  title: string;
  actionLabel?: string;
}>;

export function SectionCard({ title, actionLabel, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "700",
  },
  action: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
