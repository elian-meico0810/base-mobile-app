import { AntDesign } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
    visible: boolean;
    title: string;
    subtitle: string;
    onHide: () => void;
    topMargin?: number;
}

export function PaymentPendingAlert({ 
    visible, 
    title, 
    subtitle, 
    onHide, 
    topMargin = 24 
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

            const timer = setTimeout(() => {
                onHide();
            }, 5000);

            return () => clearTimeout(timer);
        } else {
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
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { 
                    transform: [{ translateY: slideAnim }], 
                    opacity: opacityAnim,
                    top: topMargin,
                }
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
        left: 0,
        right: 0,
        zIndex: 100,
        alignItems: "center",
    },
    alertBox: {
        width: '94%', 
        maxWidth: 400, 
        minHeight: 54,
        backgroundColor: "#E8EEF9",
        borderWidth: 1,
        borderColor: "#4F74C4",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: '4%',
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
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