import { AntDesign } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

interface Props {
    visible: boolean;
    message: string;
    subtitle?: string;
    duration?: number;
    onHide: () => void;
}

export function TopSuccessAlert({
    visible,
    message,
    subtitle,
    duration = 2000,
    onHide
}: Props) {

    const slideAnim = useRef(new Animated.Value(-80)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {

            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            const timeout = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: -80,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start(() => onHide());
            }, duration);

            return () => clearTimeout(timeout);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim
                }
            ]}
        >
            <View
                style={[
                    styles.content,
                    subtitle
                        ? styles.contentWithSubtitle
                        : styles.contentWithoutSubtitle
                ]}
            >

                {/* BOTÓN CERRAR */}
                <Pressable
                    style={styles.closeButton}
                    onPress={onHide}
                >
                    <AntDesign
                        name="close"
                        size={10}
                        color="#FFFFFF"
                    />
                </Pressable>

                <View style={styles.iconCircle}>
                    <AntDesign
                        name="check"
                        size={14}
                        color="#141D32"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.text}>
                        {message}
                    </Text>

                    {subtitle && (
                        <Text style={styles.subtitle}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        alignItems: "center",
        paddingTop: 24,
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
        width: 328,
        backgroundColor: "#141D32",
        borderRadius: 8,
        paddingHorizontal: 12,
        gap: 8,
        position: "relative",
    },

    contentWithoutSubtitle: {
        height: 40,
    },

    contentWithSubtitle: {
        height: 65,
        paddingVertical: 8,
    },

    iconCircle: {
        width: 19.5,
        height: 19.5,
        borderRadius: 20,
        backgroundColor: "#1F9144",
        justifyContent: "center",
        alignItems: "center",
    },

    textContainer: {
        flex: 1,
        justifyContent: "center",
    },

    text: {
        color: "#FFFFFF",
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 14,
    },

    subtitle: {
        color: "#FFFFFF",
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 12,
        marginTop: 2,
    },

    closeButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
});