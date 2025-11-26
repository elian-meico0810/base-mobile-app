import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
    visible: boolean;
    title: string;
    subtitle: string;
    duration?: number;
    onHide: () => void;
    topMargin?: number; // ← Nueva prop opcional
}


export function PaymentPendingAlert({ visible, title, subtitle, duration = 5000, onHide, topMargin }: Props) {
    const slideAnim = useRef(new Animated.Value(-80)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                })
            ]).start();

            const timeout = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: -80,
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
            <View style={styles.alertBox}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <AntDesign name="info" size={16} color="#FFFFFF" />
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
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
    alertBox: {
        width: 350,
        minHeight: 54,     // antes 65 — se adapta sin aplastar
        backgroundColor: "#E8EEF9",
        borderWidth: 1,
        borderColor: "#4F74C4",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    iconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#4F74C4",
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        color: "#4F74C4",
        fontFamily: "Rubik",
        fontWeight: "900",
        fontSize: 13,
        lineHeight: 16,
        marginBottom: 2,
    },
    subtitle: {
        color: "#4F74C4",
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 12,
        lineHeight: 14,
    },
});