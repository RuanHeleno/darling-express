import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "@/theme/tokens";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  fullWidth?: boolean;
};

export function PrimaryButton({ label, onPress, fullWidth = true }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, fullWidth && styles.fullWidth, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
