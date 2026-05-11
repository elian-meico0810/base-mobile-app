import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    ScrollView,
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

                    <Animated.View 
                        style={[
                            styles.container,
                            {
                                width,
                                height,
                                marginBottom: keyboardHeight
                            }
                        ]}
                    >
                        {/* Indicador visual (barra en la parte superior) */}
                        <View style={styles.handleBar} />
                        
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>
                            Selecciona el motivo del rechazo del pedido
                        </Text>

                        {/* ScrollView para la lista de causas */}
                        <ScrollView 
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                        >
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
                        </ScrollView>

                        {/* Botón fijo */}
                        <View style={styles.buttonRow}>
                            <PrimaryButton
                                title="Continuar"
                                onPress={handleConfirm}
                                disabled={selectedIndex === null}
                                width={348}
                                height={43}
                            />
                        </View>
                    </Animated.View>
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
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: "column",
        position: "relative",
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 20,
        fontWeight: "700",
        color: "#141D32",
        marginBottom: 4,
        marginTop: 8,
    },
    subtitle: {
        fontFamily: "Rubik",
        fontSize: 14,
        color: "#788095",
        marginBottom: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        gap: 10,
        paddingBottom: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 16,
        minHeight: 56,
    },
    reasonText: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "500",
        color: "#141D32",
        flex: 1,
        flexWrap: "wrap",
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
        top: 16,
        right: 16,
        zIndex: 2,
    },
    closeText: {
        fontSize: 20,
        color: "#788095",
        fontWeight: "400",
    },
    buttonRow: {
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 50,
    },
    touchableOverlay: {
        flex: 1,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    handleBar: {
        width: 36,
        height: 5,
        backgroundColor: "#E0E0E0",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 16,
    },
});