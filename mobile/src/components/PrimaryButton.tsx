import { ActivityIndicator, Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  fullWidth?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
};

export function PrimaryButton({
  label,
  onPress,
  fullWidth = true,
  loading = false,
  variant = "primary",
}: PrimaryButtonProps) {
  const base = "rounded-2xl py-4 px-6 flex-row items-center justify-center gap-2";
  const variantClass = {
    primary: "bg-brand active:bg-brand-dark",
    outline: "border-2 border-brand bg-transparent active:bg-brand/10",
    ghost: "bg-transparent active:bg-brand/10",
  }[variant];
  const labelClass = {
    primary: "text-text-inverse text-base font-bold",
    outline: "text-brand text-base font-bold",
    ghost: "text-brand text-base font-semibold",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`${base} ${variantClass} ${fullWidth ? "w-full" : ""} ${loading ? "opacity-60" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#ffffff" : "#4a154b"} size="small" />
      ) : null}
      <Text className={labelClass}>{label}</Text>
    </Pressable>
  );
}
