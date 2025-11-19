import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { LogoText } from '@/components/generals/LogoText';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { PrimaryInput } from '@/components/inputs/PrimaryInput';
import { ThemedView } from '@/components/themed-view';
import { authRepositoryImpl } from '@/src/features/auth/infrastructure/login/authRepositoryImpl';
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image, Keyboard,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export function LoginForm({ onSubmit }: { onSubmit: (guide: string) => void | Promise<void> }) {
  const [guide, setGuide] = useState("");
  const isValid = guide.length >= 6;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
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
        console.log("respones: ",response.data);
      } else {
        setErrorMessage(response?.message || "La guía no existe o es incorrecta.");
      }
    } catch (error: any) {
      setErrorMessage("Error en la consulta de datos.");
    }
  };

  return (
    <ThemedView style={styles.container}>
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

      {/* Panel blanco con altura fija */}
      <View style={[
        styles.whitePanel,
        { height: height - 200 } 
      ]}>
        <View style={styles.content}>
          <View style={styles.topContent}>
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

          <View style={[
            styles.buttonContainer,
            { marginBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 20 }
          ]}>
            <PrimaryButton
              title="Ingresar"
              onPress={handleSubmit}
              disabled={!isValid}
              width={328}
              height={50}
            />
          </View>
        </View>
      </View>
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
    zIndex: 1,
  },
  separator: {
    position: 'absolute',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 27,
    zIndex: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: 'center',
  },
});