import { LogoText } from '@/components/generals/LogoText';
import { PrimaryButton } from '@/components/generals/PrimaryButton';
import { PrimaryInput } from '@/components/generals/PrimaryInput';
import { ThemedView } from '@/components/themed-view';
import { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export function LoginForm({ onSubmit }: { onSubmit: (guide: string) => void | Promise<void> }) {

  const [guide, setGuide] = useState("");
  const isValid = guide.length >= 6;

  return (
    <ThemedView style={styles.container}>

      <View style={styles.backgroundFill} />

      <Image
        source={require('@/components/generals/Home.png')}
        style={[styles.backgroundImage, { width, height }]}
        resizeMode="cover"
      />

      {[...Array(4)].map((_, i) => (
        <View key={i} style={[styles.separator, { top: (i + 1) * (height / 5) - 1 }]} />
      ))}

      <LogoText style={styles.logo} />

      {/* KeyboardAvoidingView hace que el botón suba con el teclado */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.whitePanel}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          {/* CONTENIDO SUPERIOR */}
          <View>
            <Text style={styles.title}>¡Bienvenido!</Text>

            <Text style={styles.subtitle}>
              Ingresa el número de guía para comenzar tu ruta
            </Text>

            <PrimaryInput
              placeholder="Número de guía"
              value={guide}
              onChangeText={setGuide}
            />
          </View>

          {/* BOTÓN ABAJO */}
          <View style={{ width: "100%", marginBottom: 20 }}>
            <PrimaryButton
              title="Ingresar"
              onPress={() => onSubmit(guide)}
              disabled={!isValid}
              width={328}
              height={50}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
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
    zIndex: 2,
  },
  logo: {
    zIndex: 10,
    position: 'absolute',
    top: 100,
  },
  whitePanel: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    overflow: 'hidden',
  },
  title: {
    fontFamily: "Rubik",
    fontWeight: "600",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Rubik",
    fontWeight: "400",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    width: 328,
    height: 43,
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: '#D1D3D8',
    alignSelf: 'center',
  },
  button: {
    width: 328,
    alignSelf: "center",
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: "bold",
    fontSize: 16,
  },
});
