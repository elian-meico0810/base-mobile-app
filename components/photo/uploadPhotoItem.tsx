import { createDataUri } from "@/src/utils/uitls";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal, // Agregar Modal
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

interface UploadPhotoItemsProps {
    title: string;
    subTitle: string;
    onClose?: () => void;
    width?: number;
    onPick?: (data: { base64: string; uri: string }) => void;
    onEvidenceComplete?: (evidences: EvidencePhoto[]) => void;
    onPermisionsPhoto?: () => void;
    onPermisionsGallery?: () => void;
    maxEvidences?: number;
    visible: boolean; // Agregar prop visible
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function UploadPhotoItem({
    title,
    subTitle,
    onClose,
    width = 360,
    onPick,
    onEvidenceComplete,
    onPermisionsPhoto,
    onPermisionsGallery,
    maxEvidences = 1,
    visible
}: UploadPhotoItemsProps) {
    const [evidences, setEvidences] = useState<EvidencePhoto[]>([]);
    const [currentEvidenceIndex, setCurrentEvidenceIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [loadingType, setLoadingType] = useState<'camera' | 'gallery' | null>(null);

    // Configuración de redimensionamiento
    const IMAGE_CONFIG = {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.7,
    };

    // Función para procesar y redimensionar la imagen
    const processAndResizeImage = async (uri: string): Promise<{ uri: string; base64: string }> => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [
                    {
                        resize: {
                            width: IMAGE_CONFIG.maxWidth,
                            height: IMAGE_CONFIG.maxHeight,
                        }
                    }
                ],
                {
                    compress: IMAGE_CONFIG.compress,
                    format: IMAGE_CONFIG.format,
                    base64: true
                }
            );

            if (!manipResult.base64) {
                throw new Error("No se pudo generar base64 de la imagen procesada");
            }

            return {
                uri: manipResult.uri,
                base64: manipResult.base64
            };
        } catch (error) {
            console.error("Error procesando imagen:", error);
            throw error;
        }
    };

    // Función para manejar la selección de imagen
    const handleImageSelection = async (
        pickerFunction: () => Promise<ImagePicker.ImagePickerResult>,
        evidenceIndex: number,
        type: 'camera' | 'gallery'
    ) => {
        setIsLoading(true);
        setLoadingIndex(evidenceIndex);
        setLoadingType(type);

        try {
            const result = await pickerFunction();

            if (!result.canceled) {
                const asset = result.assets[0];
                const processedImage = await processAndResizeImage(asset.uri);
                const dataUri = createDataUri(processedImage.base64, processedImage.uri);

                const newEvidence: EvidencePhoto = {
                    id: Date.now().toString(),
                    uri: processedImage.uri,
                    base64: dataUri,
                };

                if (onPick) {
                    onPick({
                        base64: dataUri,
                        uri: processedImage.uri
                    });
                } else {
                    const updatedEvidences = [...evidences];
                    if (evidenceIndex < updatedEvidences.length) {
                        updatedEvidences[evidenceIndex] = newEvidence;
                    } else {
                        updatedEvidences.push(newEvidence);
                    }

                    setEvidences(updatedEvidences);

                    if (evidenceIndex < maxEvidences - 1 && updatedEvidences.length < maxEvidences) {
                        setCurrentEvidenceIndex(evidenceIndex + 1);
                    }
                }
            }
        } catch (error) {
            console.error("Error al seleccionar imagen:", error);
        } finally {
            setIsLoading(false);
            setLoadingIndex(null);
            setLoadingType(null);
        }
    };

    // === TOMAR FOTO (CÁMARA) ===
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            onPermisionsPhoto?.();
            return;
        }

        await handleImageSelection(
            () => ImagePicker.launchCameraAsync({
                base64: false,
                quality: 0.8,
            }),
            currentEvidenceIndex,
            'camera'
        );
    };

    // === CARGAR FOTO (GALERIA) ===
    const handlePickGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            onPermisionsGallery?.();
            return;
        }

        await handleImageSelection(
            () => ImagePicker.launchImageLibraryAsync({
                base64: false,
                quality: 0.8,
                mediaTypes: ['images'],
            }),
            currentEvidenceIndex,
            'gallery'
        );
    };

    // === ELIMINAR EVIDENCIA ===
    const handleRemoveEvidence = (index: number) => {
        const updatedEvidences = evidences.filter((_, i) => i !== index);
        setEvidences(updatedEvidences);

        if (currentEvidenceIndex >= updatedEvidences.length && updatedEvidences.length > 0) {
            setCurrentEvidenceIndex(updatedEvidences.length - 1);
        }
    };

    // === CONTINUAR CON EVIDENCIAS ===
    const handleContinue = () => {
        onEvidenceComplete?.(evidences);
        onClose?.();
    };

    // === SELECCIONAR EVIDENCIA PARA EDITAR ===
    const handleSelectEvidence = (index: number) => {
        setCurrentEvidenceIndex(index);
    };

    // Limpiar evidencias cuando se cierra el modal
    const handleClose = () => {
        setEvidences([]);
        setCurrentEvidenceIndex(0);
        onClose?.();
    };

    const isCameraLoading = isLoading && loadingType === 'camera';
    const isGalleryLoading = isLoading && loadingType === 'gallery';

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <TouchableOpacity 
                style={styles.fullScreenOverlay} 
                onPress={handleClose}
                activeOpacity={1}
            />

            <View style={styles.modalWrapper}>
                <View style={[styles.container, { width }]}>
                    <View style={styles.dragHandle} />

                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subTitleLabel}>{subTitle}</Text>

                        {/* Miniaturas de evidencias cargadas */}
                        {evidences.length > 0 && (
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
                        )}

                        <View style={{ height: 20 }} />

                        {/* Tomar foto - SOLO SE MUESTRA SI HAY MENOS DE 3 IMÁGENES */}
                        {evidences.length < maxEvidences && (
                            <TouchableOpacity
                                style={[styles.card, isCameraLoading && styles.disabledCard]}
                                onPress={handleTakePhoto}
                                disabled={isLoading}
                            >
                                <View style={styles.row}>
                                    <View style={styles.iconCircle}>
                                        {isCameraLoading ? (
                                            <ActivityIndicator size="small" color="#141D32" />
                                        ) : (
                                            <Ionicons name="camera-outline" size={16} color="#141D32" />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={[styles.cardTitle, isCameraLoading && styles.disabledText]}>
                                            {isCameraLoading ? 'Procesando...' : 'Tomar foto'}
                                        </Text>
                                        <Text style={[styles.cardSub, isCameraLoading && styles.disabledText]}>
                                            Captura una imagen en tiempo real
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Adjuntar foto - SOLO SE MUESTRA SI HAY MENOS DE 3 IMÁGENES */}
                        {evidences.length < maxEvidences && (
                            <TouchableOpacity
                                style={[styles.card, isGalleryLoading && styles.disabledCard]}
                                onPress={handlePickGallery}
                                disabled={isLoading}
                            >
                                <View style={styles.row}>
                                    <View style={styles.iconCircle}>
                                        {isGalleryLoading ? (
                                            <ActivityIndicator size="small" color="#141D32" />
                                        ) : (
                                            <Ionicons name="image-outline" size={16} color="#141D32" />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={[styles.cardTitle, isGalleryLoading && styles.disabledText]}>
                                            {isGalleryLoading ? 'Procesando...' : 'Adjuntar foto'}
                                        </Text>
                                        <Text style={[styles.cardSub, isGalleryLoading && styles.disabledText]}>
                                            Selecciona una imagen existente
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Botón Continuar (solo visible con evidencias) */}
                        {evidences.length > 0 && (
                            <View style={styles.continueButtonContainer}>
                                <PrimaryButton
                                    title={isLoading ? "Procesando..." : "Continuar"}
                                    onPress={handleContinue}
                                    disabled={isLoading}
                                    width={328}
                                    height={43}
                                />
                            </View>
                        )}
                    </View>
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
        width: "100%",
        overflow: 'hidden',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 50,
        minHeight: 400,
    },
    dragHandle: {
        alignSelf: "center",
        width: 40,
        height: 4,
        backgroundColor: "#E6E8EC",
        borderRadius: 2,
        marginTop: 8,
        marginBottom: 8,
    },
    closeButton: {
        position: "absolute",
        top: 16,
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
    },
    subTitleLabel: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 18,
        color: "#788095",
        marginBottom: 25,
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
    selectedThumbnail: {
        borderColor: "#141D32",
    },
    emptyThumbnail: {
        borderStyle: "dashed",
        borderWidth: 1,
        backgroundColor: "#F9F9FA",
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
    disabledCard: {
        opacity: 0.6,
    },
    disabledText: {
        opacity: 0.6,
    },
    card: {
        width: '100%',
        height: 67,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#E6E8EC",
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 8,
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cardTitle: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "600",
        color: "#141D32",
    },
    cardSub: {
        fontFamily: "Rubik",
        fontSize: 12,
        fontWeight: "400",
        color: "#788095",
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: "#F9F9FA",
        justifyContent: "center",
        alignItems: "center",
    },
    continueButtonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
});