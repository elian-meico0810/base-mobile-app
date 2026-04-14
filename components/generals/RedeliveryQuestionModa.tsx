import { TypeEntry } from "@/src/constants/GuideStates";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";

interface RedeliveryQuestionModalProps {
    onClose?: () => void;
    onConfirm?: (response: TypeEntry.ENTREGA_OTRO_DIA | TypeEntry.NO_ENTREGADO) => void;
}

export function RedeliveryQuestionModal({
    onClose,
    onConfirm,
}: RedeliveryQuestionModalProps) {
    const [selectedOption, setSelectedOption] = useState<TypeEntry.ENTREGA_OTRO_DIA | TypeEntry.NO_ENTREGADO | null>(null);

    const handleConfirm = () => {
        if (selectedOption) {
            onConfirm?.(selectedOption);
            onClose?.();
        }
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backgroundOverlay} onPress={onClose} />

            <View style={styles.container}>
                <View style={styles.track} />

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    ¿El cliente informa recibir el pedido otro día?
                </Text>

                <Text style={styles.subTitleLabel}>
                    Esta información nos permite programar un nuevo intento de entrega.
                </Text>

                {/* Contenedor para las dos opciones en fila */}
                <View style={styles.optionsRow}>
                    {/* Opción Sí, otro día */}
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            styles.optionCardLeft,
                            selectedOption === TypeEntry.ENTREGA_OTRO_DIA && styles.optionCardSelected
                        ]}
                        onPress={() => setSelectedOption(TypeEntry.ENTREGA_OTRO_DIA)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.radioContainer}>
                            <View style={[
                                styles.radioOuter,
                                selectedOption ===TypeEntry.ENTREGA_OTRO_DIA && styles.radioOuterSelected
                            ]}>
                                {selectedOption ===TypeEntry.ENTREGA_OTRO_DIA && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                            <Text style={styles.optionText}>Sí, otro día</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Opción No */}
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            styles.optionCardRight,
                            selectedOption === TypeEntry.NO_ENTREGADO && styles.optionCardSelected
                        ]}
                        onPress={() => setSelectedOption(TypeEntry.NO_ENTREGADO)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.radioContainer}>
                            <View style={[
                                styles.radioOuter,
                                selectedOption === TypeEntry.NO_ENTREGADO && styles.radioOuterSelected
                            ]}>
                                {selectedOption === TypeEntry.NO_ENTREGADO && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                            <Text style={styles.optionText}>No</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Botón Confirmar */}
                <PrimaryButton
                    title="Confirmar"
                    onPress={handleConfirm}
                    disabled={!selectedOption}
                    width={328}
                    height={43}
                />

                <View style={{ height: 40 }} />
            </View>
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
        zIndex: 100,
    },
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: 32,
        position: "relative",
        paddingBottom: 20,
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: "100%",
    },
    track: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 20,
    },
    closeText: {
        color: "#788095",
        fontSize: 26,
        fontWeight: "bold",
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 22,
        fontWeight: "700",
        color: "#141D32",
        marginBottom: 8,
    },
    subTitleLabel: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 18,
        color: "#788095",
        marginBottom: 25,
    },
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 24,
    },
    optionCard: {
        flex: 1,
        height: 56,
        borderWidth: 1,
        borderColor: "#E6E8EC",
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    optionCardLeft: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    optionCardRight: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    optionCardSelected: {
        borderColor: "#164194", 
        borderWidth: 2,
    },
    radioContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#C4C8D2",
        justifyContent: "center",
        alignItems: "center",
    },
    radioOuterSelected: {
        borderColor: "#164194", 
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#164194",  
    },
    optionText: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "500",
        color: "#141D32",
    },
});