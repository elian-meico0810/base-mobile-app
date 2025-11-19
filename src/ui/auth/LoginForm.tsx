import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { LogoText } from '@/components/generals/LogoText';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { PrimaryInput } from '@/components/inputs/PrimaryInput';
import { ThemedView } from '@/components/themed-view';
import { authRepositoryImpl } from '@/src/auth/infrastructure/authRepositoryImpl';
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image, Keyboard, KeyboardAvoidingView,
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
  const [keyboardOpenedOnce, setKeyboardOpenedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardOpenedOnce(true);
    });
    return () => {
      showListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!isValid) {
      setErrorMessage("El número de guía debe tener al menos 6 dígitos.");
      return;
    }
    try {
      const response = await authRepositoryImpl.login(guide);
      if (response?.statusCode == 200) {
        return
      } else {
        setErrorMessage(response?.message || "La guía no existe o es incorrecta.");
      }
    } catch (error: any) {
      setErrorMessage("Error en la consulta de datos.");
    }
  };


  return (
    <ThemedView style={styles.container}>
      {/** Validamos si tiene conexion a la red */}
      <NetworkStatus />

      <View style={[styles.backgroundFill, { width, height }]} pointerEvents="none">
        <Image
          source={require('@/assets/icons/Home.png')}
          style={[styles.backgroundImage, { width, height }]}
          resizeMode="cover"
        />
      </View>

      {[...Array(4)].map((_, i) => (
        <View key={i} style={[styles.separator, { top: (i + 1) * (height / 5) - 1 }]} />
      ))}

      <LogoText style={styles.logo} />

      {/* Solo muestra el fondo inferior si el teclado se abrió alguna vez */}
      {keyboardOpenedOnce && <View style={styles.bottomWhiteBackground} />}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.whitePanel}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingBottom: keyboardOpenedOnce ? 1 : 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.title}>¡Bienvenido!</Text>
            <Text style={styles.subtitle}>
              Ingresa el número de guía para comenzar tu ruta
            </Text>

            <PrimaryInput
              placeholder="Número de guía"
              value={guide}
              onChangeText={(text) => {
                setGuide(text);
                setErrorMessage("");
              }}
              error={errorMessage !== ""}
            />

            {errorMessage !== "" && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

          </View>

          <View style={{ width: "100%" }}>
            <PrimaryButton
              title="Ingresar"
              onPress={handleSubmit}
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
    backgroundColor: '#164194',

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
    top: 200,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 27,
    position: 'absolute',
    bottom: 0,
  },
  title: {
    fontFamily: "Rubik",
    fontWeight: "700",
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
  bottomWhiteBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: '#FFFFFF',
  },
  backgroundImageWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },

});
