import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
    visible: boolean;
    message: string;
    subtitle?: string;
    duration?: number;
    onHide: () => void;
}

export function TopErrorAlert({ visible, message, subtitle, duration = 2000, onHide }: Props) {
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
                { transform: [{ translateY: slideAnim }], opacity: opacityAnim }
            ]}
        >
            <View style={[
                styles.content,
                subtitle ? styles.contentWithSubtitle : styles.contentWithoutSubtitle
            ]}>
                <View style={styles.iconCircle}>
                    <AntDesign name="close" size={14} color="#141D32" />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.text}>{message}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
        paddingTop: 28,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        width: 328,
        backgroundColor: "#141D32",
        borderRadius: 8,
        paddingHorizontal: 12,
        gap: 8,
    },
    contentWithoutSubtitle: {
        paddingVertical: 10,
    },
    contentWithSubtitle: {
        paddingVertical: 10,
    },
    iconCircle: {
        width: 19.5,
        height: 19.5,
        borderRadius: 20,
        backgroundColor: "#C62828",
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
        flexWrap: "wrap",
    },

    subtitle: {
        color: "#FFFFFF",
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 12,
        marginTop: 2,
    },
});
