import { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type SectionCardProps = PropsWithChildren<{
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
}>;

export function SectionCard({ title, actionLabel, children }: SectionCardProps) {
  return (
    <View className="bg-surface rounded-3xl p-5 gap-4 shadow-sm border border-border">
      {title ? (
        <View className="flex-row justify-between items-center">
          <Text className="text-brand-dark text-lg font-bold">{title}</Text>
          {actionLabel ? (
            <Text className="text-rose-medium text-sm font-semibold">{actionLabel}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
