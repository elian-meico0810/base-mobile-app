// En ConsignmentData.tsx - Con funcionalidad de formato en el input
import { OutlineButton } from "@/components/buttons/OutlineButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButtonCancel } from "@/components/buttons/SecondaryButtonCancel";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Keyboard,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

interface ConsignmentDataProps {
    title: string;
    subTitle: string;
    onClose?: () => void;
    width?: number;
    visible: boolean;
    titleTwo?: string;
    onUploadFile?: () => void;
    evidencePhotos?: EvidencePhoto[];
    onValue?: (value: string) => void;
    value?: string;
    onConfirmation?: () => void;
    isLoading?: boolean;
}

export function ConsignmentData({
    title,
    subTitle,
    onClose,
    width = 360,
    visible,
    titleTwo,
    onUploadFile,
    evidencePhotos = [],
    onValue,
    value,
    onConfirmation,
    isLoading: externalLoading = false
}: ConsignmentDataProps) {
    const [internalLoading, setInternalLoading] = useState(false);
    const isLoading = internalLoading || externalLoading;
    const [amount, setAmount] = useState("");
    const [displayAmount, setDisplayAmount] = useState(value ?? "");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [evidences, setEvidences] = useState<EvidencePhoto[]>(evidencePhotos);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [currentEvidenceIndex, setCurrentEvidenceIndex] = useState(0);

    useEffect(() => {
        if (value) {
            const numericValue = value.replace(/\D/g, "");
            const formatted = Number(numericValue).toLocaleString("es-CO");
            setDisplayAmount(formatted);
        } else {
            setDisplayAmount("");
        }
    }, [value]);


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const formatNumberWithCommas = (value: string): string => {
        const numericValue = value.replace(/\D/g, "");

        if (!numericValue) return "";

        return Number(numericValue).toLocaleString("es-CO");
    };

    const handleAmountChange = (text: string) => {
        const numericValue = text.replace(/\D/g, "");
        setAmount(numericValue);


        setDisplayAmount(formatNumberWithCommas(numericValue));
        if (onValue) {
            onValue(numericValue);
        }
    };

    const getNumericValue = (): number => {
        return amount ? parseInt(amount, 10) : 0;
    };

    useEffect(() => {
        if (!visible) {
            setAmount("");
            setDisplayAmount("");
        }
    }, [visible]);

    // === ELIMINAR EVIDENCIA ===
    const handleRemoveEvidence = (index: number) => {
        const updatedEvidences = evidences.filter((_, i) => i !== index);
        setEvidences(updatedEvidences);

        if (index < currentEvidenceIndex) {
            setCurrentEvidenceIndex(currentEvidenceIndex - 1);
        } else if (currentEvidenceIndex >= updatedEvidences.length && updatedEvidences.length > 0) {
            setCurrentEvidenceIndex(updatedEvidences.length - 1);
        }
    };

    // === SELECCIONAR EVIDENCIA PARA EDITAR ===
    const handleSelectEvidence = (index: number) => {
        setCurrentEvidenceIndex(index);
    };

    const numericValue = Number(displayAmount.replace(/\D/g, ""));
    const isValid = displayAmount != "" && numericValue > 0;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.fullScreenOverlay}
                onPress={onClose}
                activeOpacity={1}
            />

            <View style={styles.modalWrapper}>
                <View style={[
                    styles.container,
                    {
                        width,
                        marginBottom: keyboardHeight > 0 ? keyboardHeight : 0
                    }
                ]}>
                    <View style={styles.dragHandle} />

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Títulos */}
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subTitleLabel}>{subTitle}</Text>

                        {/* Input de valor */}
                        <Text style={styles.inputLabel}>Valor consignado</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currency}>$</Text>
                            <TextInput
                                style={styles.amountInput}
                                keyboardType="numeric"
                                placeholder="0"
                                value={displayAmount}
                                onChangeText={handleAmountChange}
                                maxLength={15}
                                placeholderTextColor={"#141D32"}
                            />
                            <Text style={styles.currency}>COP</Text>
                        </View>

                        <Text style={styles.titleTwo}>{titleTwo}</Text>

                        {evidences.length > 0 ? (
                            <View style={styles.evidenceThumbnailsContainer}>
                                <View style={styles.thumbnailsColumn}>
                                    {evidences.map((evidence, index) => (
                                        <View key={evidence.id} style={styles.thumbnailRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.thumbnailContainer,
                                                    currentEvidenceIndex === index && styles.selectedThumbnail
                                                ]}
                                                onPress={() => handleSelectEvidence(index)}
                                                disabled={isLoading}
                                            >
                                                {isLoading && loadingIndex === index ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#141D32"
                                                        style={styles.loadingIndicator}
                                                    />
                                                ) : (
                                                    <Image
                                                        source={{ uri: evidence.uri }}
                                                        style={styles.thumbnailImage}
                                                    />
                                                )}
                                            </TouchableOpacity>

                                            <Text style={styles.thumbnailLabel}>
                                                Evidencia {index + 1}
                                            </Text>

                                            <TouchableOpacity
                                                style={styles.trashButton}
                                                onPress={() => handleRemoveEvidence(index)}
                                                disabled={isLoading}
                                            >
                                                <Ionicons name="trash-outline" size={20} color="#141D32" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    {/* Mostrar loading para la próxima evidencia */}
                                    {isLoading && loadingIndex !== null && loadingIndex >= evidences.length && (
                                        <View style={styles.thumbnailRow}>
                                            <View style={[styles.thumbnailContainer, styles.emptyThumbnail]}>
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#141D32"
                                                    style={styles.loadingIndicator}
                                                />
                                            </View>

                                            <Text style={[styles.thumbnailLabel, styles.emptyLabel]}>
                                                Evidencia {evidences.length + 1}
                                            </Text>

                                            <View style={styles.trashButtonPlaceholder} />
                                        </View>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <>
                                <View style={styles.outlineButtonWrapper}>
                                    <OutlineButton
                                        title="Agregar evidencia"
                                        onPress={() => {
                                            onUploadFile?.();
                                            onValue?.(displayAmount);
                                        }}
                                        width={328}
                                        height={34}
                                    />
                                </View>
                            </>

                        )}

                        {/* Botones principales */}
                        <View style={styles.buttonsWrapper}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#164194" style={{ marginVertical: 20 }} />
                            ) : (
                                <>
                                    <PrimaryButton
                                        title={"Confirmar"}
                                        onPress={() => {
                                            onConfirmation?.();
                                            onValue?.(displayAmount);
                                        }}
                                        disabled={!isValid}
                                        width={328}
                                        height={43}
                                    />

                                    <View style={styles.cancelButtonWrapper}>
                                        <SecondaryButtonCancel
                                            title="Cancelar"
                                            onPress={() => { onClose?.() }}
                                            disabled={false}
                                            width={328}
                                            height={43}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fullScreenOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    container: {
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    dragHandle: {
        alignSelf: "center",
        width: 40,
        backgroundColor: "#E6E8EC",
        borderRadius: 2,
        marginTop: 8,
        marginBottom: 8,
    },
    scrollView: {
        maxHeight: "100%",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        minHeight: 400,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 16,
        zIndex: 20,
        padding: 8,
        backgroundColor: 'transparent',
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
        marginTop: 0,
    },
    titleTwo: {
        fontFamily: "Rubik",
        fontSize: 18,
        fontWeight: "700",
        color: "#141D32",
        marginBottom: 8,
        marginTop: 0,
    },
    subTitleLabel: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 18,
        color: "#788095",
        marginBottom: 25,
    },
    inputLabel: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "400",
        color: "#788095",
        marginBottom: 8,
    },
    amountContainer: {
        width: "100%",
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#F0F1F5",
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 6,
        marginBottom: 30,
    },
    currency: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "500",
        color: "#141D32",
    },
    amountInput: {
        flex: 1,
        fontFamily: "Rubik",
        fontSize: 16,
        fontWeight: "500",
        color: "#141D32",
        backgroundColor: "transparent",
        height: 44,
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    debugText: {
        fontFamily: "Rubik",
        fontSize: 12,
        color: "#788095",
        marginBottom: 10,
        textAlign: "center",
    },
    outlineButtonWrapper: {
        marginBottom: 24,
    },
    buttonsWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    cancelButtonWrapper: {
        marginTop: 12,
        width: '100%',
        alignItems: 'center',
    },
    thumbnailContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#E6E8EC",
        justifyContent: "center",
        alignItems: "center",
    },
    evidenceThumbnailsContainer: {
        marginBottom: 20,
    },
    thumbnailsColumn: {
        flexDirection: "column",
        gap: 16,
    },
    thumbnailRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectedThumbnail: {
        borderColor: "#141D32",
    },
    emptyLabel: {
        color: "#788095",
    },
    trashButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    trashButtonPlaceholder: {
        width: 40,
        height: 40,
    },
    loadingIndicator: {
        padding: 8,
    },
    thumbnailImage: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
    thumbnailLabel: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "500",
        color: "#141D32",
        flex: 1,
        marginLeft: 12,
    },
    emptyThumbnail: {
        borderStyle: "dashed",
        borderWidth: 1,
        backgroundColor: "#F9F9FA",
    },
});