import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { Cause } from "../../tracking/domain/details/DetailsGuide";

interface Props {
    title: string;
    onPress?: (cause: Cause) => void;
    onClose?: () => void;
    width?: number;
    height?: number;
    showTypeDetails?: Cause[];
}

export function ReportMassiveRejectScreen({
    title,
    onPress,
    onClose,
    width = 385,
    height = 480,
    showTypeDetails
}: Props) {

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [keyboardHeight] = useState(new Animated.Value(0));

    const handleConfirm = () => {
        if (selectedIndex === null) return;
        onPress?.(showTypeDetails![selectedIndex]);
        onClose?.();
    };

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: e.endCoordinates.height,
                    useNativeDriver: false,
                }).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    return (
        <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.touchableOverlay}>

                    <TouchableOpacity
                        style={styles.backgroundOverlay}
                        activeOpacity={1}
                        onPress={onClose}
                    />

                    <View style={[styles.container,
                    {
                        width,
                        height,
                        marginBottom: keyboardHeight
                    }]}>

                        <View style={styles.track} />

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>{title}</Text>

                        <Text style={styles.subtitle}>
                            Selecciona el motivo del rechazo del pedido
                        </Text>

                        <View style={styles.list}>
                            {showTypeDetails?.map((item, index) => {

                                const selected = selectedIndex === index;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.row}
                                        onPress={() => setSelectedIndex(index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.radioOuter,
                                            selected && styles.radioOuterSelected
                                        ]}>
                                            {selected && <View style={styles.radioInner} />}
                                        </View>

                                        <Text style={styles.reasonText}>
                                            {item.nombre}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.buttonRow}>
                            <PrimaryButton
                                title="Continuar"
                                onPress={handleConfirm}
                                disabled={selectedIndex === null}
                                width={348}
                                height={43}
                            />
                        </View>

                    </View>
                </View>
            </TouchableWithoutFeedback>
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
        justifyContent: "flex-end",
        alignItems: "center",
    },

    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },

    container: {
        width: "100%",
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    title: {
        fontFamily: "Rubik",
        fontSize: 20,
        fontWeight: "700",
        color: "#141D32",
        marginBottom: 4,
    },

    subtitle: {
        fontFamily: "Rubik",
        fontSize: 14,
        color: "#788095",
        marginBottom: 16,
    },

    list: {
        gap: 10,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 16,
        height: 56,
    },

    reasonText: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "500",
        color: "#141D32",
    },

    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#D0D5DD",
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF",
    },

    radioOuterSelected: {
        borderColor: "#1F9144",
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#1F9144",
    },

    closeButton: {
        position: "absolute",
        top: 18,
        right: 18,
    },

    closeText: {
        fontSize: 18,
        color: "#788095",
        fontWeight: "600",
    },

    buttonRow: {
        alignItems: "center",
        marginTop: 24,
    },
    touchableOverlay: {
        flex: 1,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    track: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,

        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
});

