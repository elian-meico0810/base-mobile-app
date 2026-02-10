import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LogoText } from '@/components/generals/LogoText';
import { TokenExpiredModal } from '@/components/generals/TokenExpiredModal';
import { PrimaryInput } from '@/components/inputs/PrimaryInput';
import { ThemedView } from '@/components/themed-view';
import { authRepositoryImpl } from '@/src/features/auth/infrastructure/login/authRepositoryImpl';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { decodeJWT } from '@/src/utils/jwt';
import { heightCaldulate } from '@/src/utils/uitls';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenEncode, setTokeEncode] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isValid = guide.length >= 5;
  const router = useRouter();

  const heightValue = heightCaldulate();

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


  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        if (token) {
          const data = decodeJWT(token);
          setTokenData(data);
          setTokeEncode(token);
        }
      } catch (error) {
        console.error('Error al leer token:', error);
      }
    };

    fetchToken();
  }, []);


  useEffect(() => {
    const validateToken = async () => {
      try {
        // Primero verificamos conexión
        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
          // Si hay conexión, validamos token
          if (tokenData?.empresa && tokenData?.numeroGuia) {
            if (tokenData?.exp) {
              const now = Math.floor(Date.now() / 1000);
              const exp = tokenData.exp;

              if (exp) {
                if (now >= exp) {
                  setShowModal(true);
                } else {
                  router.push({
                    pathname: '/views/details',
                    params: {
                      guide: Number(tokenData?.numeroGuia),
                      token: String(tokenEncode)
                    }
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al validar token:', error);
      }
    };

    validateToken();
  }, [tokenData, tokenEncode]);

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!isValid) {
      setErrorMessage("El número de guía debe tener al menos 5 dígitos.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await authRepositoryImpl.login(guide);
      if (response?.statusCode == 200) {
        const tokenString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.setItemAsync('user_token', tokenString);
        try {
          const tokenProductsResponse = await detailsRepositoryImpl.tokenPorductsMeicoTrack(String(response.data));
          if (tokenProductsResponse?.statusCode == 200 &&
            tokenProductsResponse?.data &&
            !Array.isArray(tokenProductsResponse.data) &&
            typeof tokenProductsResponse.data !== "string") {
            await SecureStore.setItemAsync('service_token', tokenProductsResponse.data.token);
            await SecureStore.setItemAsync('base_url', tokenProductsResponse.data.base_url);
            const inicializateToken = new Date();
            const formatted = inicializateToken.toLocaleString('sv-SE').replace('T', ' ');
            await SecureStore.setItemAsync('date_token', formatted);
          }
        } catch (error) {
        }
        // Tu response.data es un JWT token, no un objeto
        router.push({
          pathname: '/views/details',
          params: {
            guide: Number(guide),
            token: String(response.data)
          }

        });
      } else {
        setErrorMessage(response?.message || "La guía no existe o es incorrecta.");
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message ?? "Error en la consulta de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TokenExpiredModal visible={showModal} onClose={() => setShowModal(false)} />

      {/* <NetworkStatus /> */}

      <View style={[styles.backgroundFill, { width, height }]} pointerEvents="none">
        <Image
          source={require('@/assets/icons/Welcome.png')}
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
        { height: height - (heightValue ? 150 : 210) }
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
            { marginBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 25 }
          ]}>
            <PrimaryButton
              title="Ingresar"
              onPress={handleSubmit}
              disabled={!isValid}
              width={328}
              height={43}
            />
          </View>
        </View>
      </View>
      {isLoading && <LoadingBlue />}
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
    backgroundColor: '#143881ff',
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
