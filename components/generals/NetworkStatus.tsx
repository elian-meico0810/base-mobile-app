import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";

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
            const state = await NetInfo.fetch();

            if (state.isConnected) {
                const check = await fetch("https://www.google.com", { method: "HEAD" });
                if (check.ok) setIsConnected(true);
                else setIsConnected(false);
            } else setIsConnected(false);

            if (isConnected) closeModal();
        } catch {
            setIsConnected(false);
        } finally {
            setChecking(false);
        }
    };

    if (!visible) return null;
    
    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                    },
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
                    <Text style={styles.subtitle}>Verifica tu conexión e inténtalo nuevamente.</Text>

                    <PrimaryButton
                        title="Reintentar"
                        onPress={retryConnection}
                        disabled={false}
                        width={328}
                        height={50}
                    />
                </View>
            </Animated.View>
        </View>
    );


}

const styles = StyleSheet.create({
    modalContainer: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
        zIndex: 999,
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

    icon: {
        width: 108.49629211425781,
        height: 193.41,
        marginBottom: 20,
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

    button: {
        backgroundColor: "#003DA5",
        paddingVertical: 14,
        paddingHorizontal: 60,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    imageWrapper: {
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        marginBottom: 20,
    },
    errorIcon: {
        width: 43,
        height: 31,
        position: "absolute",
        top: "40%",
        resizeMode: "contain",
    },
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

});
