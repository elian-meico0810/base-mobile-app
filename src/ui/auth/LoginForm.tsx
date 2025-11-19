import { LogoText } from '@/components/generals/LogoText';
import { ThemedView } from '@/components/themed-view';
import { useState } from "react";
import { Button, Dimensions, Image, StyleSheet, TextInput, View } from "react-native";

const { width, height } = Dimensions.get('window');

export function LoginForm({ onSubmit }: { onSubmit: (e: string, p: string) => void | Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ThemedView style={styles.container}>
      {/* Fondo azul */}
      <View style={styles.backgroundFill} />

      {/* Imagen de fondo ocupando toda la pantalla */}
      <Image
        source={require('@/components/generals/Home.png')}
        style={[styles.backgroundImage, { width: width , height: height}]}
        resizeMode="cover"
      />

      {/* Líneas diagonales */}
      {[...Array(4)].map((_, i) => (
        <View key={i} style={[styles.separator, { top: (i + 1) * (height / 5) - 1 }]} />
      ))}

      {/* Logo */}
      <LogoText style={{ zIndex: 10, position: 'relative', marginBottom: 40 }} />

      {/* Formulario */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Button title="Entrar" onPress={() => onSubmit(email, password)} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#164194',
    zIndex: 0,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,                        
  },
  separator: {
    position: 'absolute',
    width: width * 5,
    height: 5,
    transform: [{ rotate: '-15deg' }],
    zIndex: 5,
  },
  form: {
    width: '80%',
    gap: 12,
    zIndex: 10,
    marginTop: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
