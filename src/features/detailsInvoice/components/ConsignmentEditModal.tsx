import { OutlineButton } from "@/components/buttons/OutlineButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButtonCancel } from "@/components/buttons/SecondaryButtonCancel";
import { Consignment } from "@/src/features/tracking/domain/consignments/Consignment";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
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

interface ConsignmentEditModalProps {
    visible: boolean;
    onClose: () => void;
    consignment: Consignment | null;
    onSave: (amount: string, evidences: EvidencePhoto[]) => void;
    isLoading?: boolean;
    width?: number;
    onUploadFile?: () => void;
    evidencePhotos?: EvidencePhoto[];
}

export function ConsignmentEditModal({
    visible,
    onClose,
    consignment,
    onSave,
    isLoading = false,
    width = 360,
    onUploadFile,
    evidencePhotos = []
}: ConsignmentEditModalProps) {
    const [amount, setAmount] = useState("");
    const [displayAmount, setDisplayAmount] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [evidences, setEvidences] = useState<EvidencePhoto[]>([]);
    const [currentEvidenceIndex, setCurrentEvidenceIndex] = useState(0);
    const [sasToken, setSasToken] = useState("");
    const [initialAmount, setInitialAmount] = useState("");
    const [initialEvidences, setInitialEvidences] = useState<EvidencePhoto[]>([]);

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync("service_token");
            setSasToken(token || "");
        };
        loadToken();
    }, []);

    useEffect(() => {
        if (visible && consignment) {
            const val = consignment.valorConsignado.toString();

            setAmount(val);
            setDisplayAmount(Number(val).toLocaleString("es-CO"));

            setInitialAmount(val);

            if (!evidencePhotos || evidencePhotos.length === 0) {
                const existingEvidences: EvidencePhoto[] = consignment.evidencias.map(e => ({
                    id: e.id.toString(),
                    uri: sasToken ? `${e.url}${sasToken}` : e.url
                }));

                setEvidences(existingEvidences);
                setInitialEvidences(existingEvidences);
            }
        }
    }, [visible, consignment, sasToken, evidencePhotos]);

    useEffect(() => {
        if (visible && evidencePhotos && evidencePhotos.length > 0) {
            setEvidences(evidencePhotos);
        }
    }, [visible, evidencePhotos]);


    const getFormattedTime = () => {
        if (!consignment) return "";
        const date = new Date(consignment.fechaHoraDispositivo);
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    };

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
    };

    const handleRemoveEvidence = (index: number) => {
        const updatedEvidences = evidences.filter((_, i) => i !== index);
        setEvidences(updatedEvidences);
        if (index < currentEvidenceIndex) {
            setCurrentEvidenceIndex(currentEvidenceIndex - 1);
        } else if (currentEvidenceIndex >= updatedEvidences.length && updatedEvidences.length > 0) {
            setCurrentEvidenceIndex(updatedEvidences.length - 1);
        }
    };

    const handleSelectEvidence = (index: number) => {
        setCurrentEvidenceIndex(index);
    };

    const numericValue = Number(displayAmount.replace(/\D/g, ""));
    const isValid = displayAmount != "" && numericValue > 0;
    
    const hasAmountChanged = amount !== initialAmount;

    const getEvidenceKey = (e?: EvidencePhoto) => {
        if (!e) return "";
        // prioridad: base64 (imagen nueva)
        if (e.base64) return e.base64;
        // luego id (backend)
        if (e.id) return e.id;
        // fallback
        return e.uri;
    };

    const hasEvidenceChanged = getEvidenceKey(evidences[0]) !== getEvidenceKey(initialEvidences[0]);

    const hasChanges = (hasAmountChanged && evidences.length > 0) || evidences.length > 0 && evidences.length !== initialEvidences.length;

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
                        <Text style={styles.title}>Editar consignación</Text>
                        <Text style={styles.subTitleLabel}>Registrada a las {getFormattedTime()}</Text>

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

                        <Text style={styles.titleTwo}>Comprobante de la consignación</Text>

                        {evidences.length > 0 ? (
                            <View style={styles.evidenceThumbnailsContainer}>
                                <View style={styles.thumbnailsColumn}>
                                    {evidences.map((evidence, index) => (
                                        <View key={evidence.id || index} style={styles.thumbnailRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.thumbnailContainer,
                                                    currentEvidenceIndex === index && styles.selectedThumbnail
                                                ]}
                                                onPress={() => handleSelectEvidence(index)}
                                                disabled={isLoading}
                                            >
                                                <Image
                                                    source={{ uri: evidence.uri }}
                                                    style={styles.thumbnailImage}
                                                />
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
                                </View>
                            </View>
                        ) : (
                            <View style={styles.outlineButtonWrapper}>
                                <OutlineButton
                                    title="Agregar evidencia"
                                    onPress={() => {
                                        onUploadFile?.();
                                    }}
                                    width={328}
                                    height={34}
                                />
                            </View>
                        )}

                        <View style={styles.buttonsWrapper}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#164194" style={{ marginVertical: 20 }} />
                            ) : (
                                <>
                                    <PrimaryButton
                                        title={"Guardar cambios"}
                                        onPress={() => {
                                            if (!isValid || !hasChanges) return;
                                            onSave(amount, evidences);
                                        }}
                                        disabled={!(isValid && hasChanges)}
                                        width={328}
                                        height={43}
                                    />

                                    <View style={styles.cancelButtonWrapper}>
                                        <SecondaryButtonCancel
                                            title="Cancelar"
                                            onPress={onClose}
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
    outlineButtonWrapper: {
        marginBottom: 24,
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
    trashButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
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
});
