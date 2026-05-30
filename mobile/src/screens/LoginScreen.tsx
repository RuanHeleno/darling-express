import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, PrimaryButton, TextField } from "@/components";
import { useMagicLink } from "@/features/auth/useMagicLink";

export function LoginScreen() {
  const [phone, setPhone] = useState("+55 ");
  const magicLink = useMagicLink();

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
