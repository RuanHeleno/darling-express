import { Text, View } from "react-native";

type BadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
};

const toneClass: Record<NonNullable<BadgeProps["tone"]>, { bg: string; text: string }> = {
  neutral: { bg: "bg-muted", text: "text-text-muted" },
  success: { bg: "bg-green-50", text: "text-status-success" },
  warning: { bg: "bg-amber-50", text: "text-status-warning" },
  danger: { bg: "bg-red-50", text: "text-status-danger" },
  accent: { bg: "bg-rose-100", text: "text-brand" },
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const { bg, text } = toneClass[tone];
  return (
    <View className={`${bg} self-start px-3 py-1.5 rounded-full`}>
      <Text className={`${text} text-xs font-bold uppercase tracking-widest`}>{label}</Text>
    </View>
  );
}
