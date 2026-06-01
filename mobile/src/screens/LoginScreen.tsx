import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { Badge, PrimaryButton, TextField } from "@/components";
import { useMagicLink } from "@/features/auth/useMagicLink";
import { useAuthStore, type UserRole } from "@/stores/authStore";
import type { AuthStackParamList } from "@/navigation/AuthStack";

function decodeRoleFromJwt(token: string): UserRole | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }
    const atobFn = (globalThis as { atob?: (data: string) => string }).atob;
    if (!atobFn) {
      return null;
    }
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const parsed = JSON.parse(atobFn(padded)) as { role?: unknown };
    return parsed.role === "ADMIN" || parsed.role === "CLIENT" ? parsed.role : null;
  } catch {
    return null;
  }
}

export function LoginScreen() {
  const route = useRoute<RouteProp<AuthStackParamList, "Login">>();
  const setSession = useAuthStore((state) => state.setSession);
  const [phone, setPhone] = useState("+55 ");
  const magicLink = useMagicLink();

  useEffect(() => {
    const token = route.params?.token;
    if (!token) {
      return;
    }
    const role = decodeRoleFromJwt(token) ?? "CLIENT";
    setSession(token, role);
  }, [route.params?.token, setSession]);

  return (
    <SafeAreaView className="flex-1 bg-brand" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Brand hero ─────────────────────────────────────────── */}
        <View className="items-center justify-center px-8 pt-10 pb-8 gap-3">
          <Text className="text-6xl">💅</Text>
          <Text className="text-white text-3xl font-extrabold tracking-tight text-center">
            Esmalteria Express
          </Text>
          <Text className="text-rose-soft text-base text-center leading-6 opacity-90">
            Beleza na palma da sua mão.{"\n"}Login rápido com link mágico.
          </Text>
        </View>

        {/* ── Login card sheet ────────────────────────────────────── */}
        <ScrollView
          className="flex-1 bg-surface rounded-t-[32px]"
          contentContainerClassName="px-6 pt-8 pb-10 gap-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header row */}
          <View className="gap-2">
            <Text className="text-brand-dark text-2xl font-extrabold">Entrar</Text>
            <Text className="text-text-muted text-sm leading-5">
              Informe seu celular e enviaremos um link de acesso seguro.
            </Text>
          </View>

          {/* Status badges */}
          <View className="flex-row flex-wrap gap-2">
            <Badge label="MVP pronto para salão" tone="accent" />
            <Badge label="RBAC ativo" tone="neutral" />
          </View>

          {/* Form */}
          <View className="gap-4">
            <TextField
              label="Celular"
              placeholder="+55 11 99999-9999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <PrimaryButton
              label={magicLink.isPending ? "Enviando..." : "Enviar link de acesso"}
              loading={magicLink.isPending}
              onPress={() => magicLink.mutate({ phone })}
            />
          </View>

          {/* Footer note */}
          <View className="flex-row items-center gap-2 bg-muted rounded-2xl px-4 py-3">
            <Text className="text-base">🔐</Text>
            <Text className="text-text-muted text-xs leading-5 flex-1">
              Sessão válida por 7 dias. Nenhuma senha é necessária.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
