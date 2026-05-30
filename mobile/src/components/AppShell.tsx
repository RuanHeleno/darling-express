import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

type AppShellProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  /** When true, removes the default header block and padding so screens can own their own layout */
  bare?: boolean;
}>;

export function AppShell({ title, subtitle, children, bare = false }: AppShellProps) {
  if (bare) {
    return (
      <SafeAreaView className="flex-1 bg-muted">
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <ScrollView
        contentContainerClassName="gap-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <View className="px-6 pt-6 gap-1">
            <Text className="text-brand-dark text-3xl font-bold tracking-tight">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-text-muted text-base leading-6">{subtitle}</Text>
            ) : null}
          </View>
        ) : null}
        <View className="px-6 gap-5">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
