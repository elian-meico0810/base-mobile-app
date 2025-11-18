import { useState } from "react";
import { Button, TextInput, View } from "react-native";

export function LoginForm({ onSubmit }: { onSubmit: (e: string, p: string) => void | Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Button title="Entrar" onPress={() => onSubmit(email, password)} />
    </View>
  );
}
