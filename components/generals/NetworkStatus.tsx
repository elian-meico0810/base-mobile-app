import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { LoadingBlue } from "./LoadingBlue";

const { width, height } = Dimensions.get('window');

export function NetworkStatus() {
    const [isConnected, setIsConnected] = useState(true);
    const [checking, setChecking] = useState(false);
    const [visible, setVisible] = useState(true);

    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = Boolean(state.isConnected && state.isInternetReachable);
            setIsConnected(online);

            if (!online) openModal();
            else closeModal();
        });

        return () => unsubscribe();
    }, []);

    const openModal = () => {
        setVisible(true); // asegurar que se muestre
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 500,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
        });
    };

    const retryConnection = async () => {
        setChecking(true);
        try {
            // Creamos un timeout de 10 segundos
            const delay = new Promise(res => setTimeout(res, 10000));

            // Verificación real de internet
            const checkConnection = (async () => {
                const state = await NetInfo.fetch();
                let connected = Boolean(state.isConnected && state.isInternetReachable);

                if (connected) {
                    const response = await fetch("https://www.google.com", { method: "HEAD" });
                    connected = response.ok;
                }
                setIsConnected(connected);
            })();

            await Promise.all([delay, checkConnection]);

            if (isConnected) {
                closeModal();
            }

        } catch (error) {
            setIsConnected(false);
        } finally {
            setChecking(false);
        }
    };


    if (!visible) return null;
    const isSmallScreen = height <= 780;

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.cardContainer,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                <View style={styles.card}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={require("@/assets/icons/Phone.png")}
                            style={styles.icon}
                        />
                        <Image
                            source={require("@/assets/icons/ErrorConnection.png")}
                            style={styles.errorIcon}
                        />
                    </View>

                    <Text style={styles.title}>Sin conexión a internet</Text>
                    <Text style={styles.subtitle}>
                        Verifica tu conexión e inténtalo nuevamente.
                    </Text>
                    <View style={{
                        alignItems: 'center',
                        position: 'absolute',
                        bottom: 50,
                        alignSelf: 'center'
                    }}>
                        <PrimaryButton
                            title="Reintentar"
                            onPress={retryConnection}
                            disabled={checking}
                            width={328}
                            height={50}
                        />
                    </View>

                </View>
            </Animated.View>

            {checking && <LoadingBlue />}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
        zIndex: 999,
    },
    cardContainer: {
        width: "100%",
    },
    card: {
        width: width,
        height: 426,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 30,
        alignItems: "center",
        elevation: 5,
    },
    imageWrapper: {
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        marginBottom: 20,
    },
    icon: {
        width: 108,
        height: 193,
        marginBottom: 20,
        resizeMode: "contain",
    },
    errorIcon: {
        width: 43,
        height: 31,
        position: "absolute",
        top: "40%",
        resizeMode: "contain",
    },
    title: {
        fontWeight: "700",
        fontSize: 20,
        marginBottom: 8,
        color: "#0B1A33",
    },
    subtitle: {
        textAlign: "center",
        color: "#677",
        marginBottom: 20,
    },
});
