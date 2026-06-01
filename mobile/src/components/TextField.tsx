import { TextInput, View, Text } from "react-native";

type TextFieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  keyboardType?: "default" | "phone-pad" | "numeric";
  secureTextEntry?: boolean;
};

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
}: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-text-muted text-sm font-semibold">{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9ca3af"
        className="bg-muted border border-border rounded-2xl px-4 py-4 text-text text-base"
      />
    </View>
  );
}
