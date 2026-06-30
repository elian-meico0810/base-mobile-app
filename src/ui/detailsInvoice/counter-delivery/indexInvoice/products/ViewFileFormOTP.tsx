import { TopErrorAlert } from "@/components/alerts/TopErrorAlert";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { NetworkStatus } from "@/components/generals/NetworkStatus";
import { ThemedView } from "@/components/themed-view";
import { GuideDetails } from "@/src/features/tracking/domain/details/DetailsGuide";
import { detailsRepositoryImpl } from "@/src/features/tracking/infrastructure/details/detailsRepositoryImpl";
import { invoiceRepositoryImpl } from "@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl";
import { createDataUri } from "@/src/utils/uitls";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

interface UploadPhotosProps {
    onPick?: (data: { base64: string; uri: string }) => void;
    onEvidenceComplete?: (evidences: EvidencePhoto[]) => void;
    onPermisionsPhoto?: () => void;
    onPermisionsGallery?: () => void;
    maxEvidences?: number;
    multiplePhotos?: EvidencePhoto[];
    sasToken?: any;
    initialGuide?: GuideDetails;
    token?: string;
    numberGuide?: number;
    isViewDetailsPorducts?: boolean;
    isSelectInvocies?: string;
    isAnticipe?: string;

}

const { width, height } = Dimensions.get('window');

export function ViewFileFormOTP({
    onPick,
    onEvidenceComplete,
    onPermisionsPhoto,
    onPermisionsGallery,
    maxEvidences = 3,
    multiplePhotos,
    sasToken,
    initialGuide,
    token = "",
    numberGuide,
    isViewDetailsPorducts,
    isSelectInvocies,
    isAnticipe
}: UploadPhotosProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [evidences, setEvidences] = useState<EvidencePhoto[]>([]);
    const [currentEvidenceIndex, setCurrentEvidenceIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [loadingType, setLoadingType] = useState<'camera' | 'gallery' | null>(null);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [showErrorQRP, setShowErrorQRP] = useState(false);
    const [showErrorQRPMessage, setShowErrorQRPMessage] = useState("Código OTP incorrecto");
    const [showErrorQRPMessageView, setShowErrorQRPMessageView] = useState("Código vencido");
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleGoBack = () => {
        router.back();

    };

    // Configuración de redimensionamiento
    const IMAGE_CONFIG = {
        maxWidth: 1024,  // Ancho máximo
        maxHeight: 1024, // Alto máximo
        quality: 0.7,    // Calidad de compresión (0.1 - 1.0)
        format: ImageManipulator.SaveFormat.JPEG, // Formato de salida
        compress: 0.7,   // Nivel de compresión
    };

    useEffect(() => {
        if (multiplePhotos && multiplePhotos.length > 0) {

            const mappedPhotos: EvidencePhoto[] = multiplePhotos.map((photo, index) => {

                const hasQueryParams = photo.uri?.includes('?');

                const finalUri = photo.uri

                return {
                    id: photo.id || `${Date.now()}-${index}`,
                    uri: finalUri,
                    base64: photo.base64,
                };
            });

            setEvidences(mappedPhotos);
        }
    }, [multiplePhotos, sasToken]);


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
                    base64: true // Incluir base64 en el resultado
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

                // Procesar la imagen (redimensionar y comprimir)
                const processedImage = await processAndResizeImage(asset.uri);

                // Crear data URI con el formato correcto
                const dataUri = createDataUri(processedImage.base64, processedImage.uri);

                const newEvidence: EvidencePhoto = {
                    id: Date.now().toString(),
                    uri: processedImage.uri, // Usar la URI procesada
                    base64: dataUri,
                };

                if (onPick) {
                    // Modo simple: devuelve el data URI procesado
                    onPick({
                        base64: dataUri,
                        uri: processedImage.uri
                    });
                } else {
                    // Modo múltiples evidencias
                    const updatedEvidences = [...evidences];

                    // Reemplazar o agregar en la posición actual
                    if (evidenceIndex < updatedEvidences.length) {
                        updatedEvidences[evidenceIndex] = newEvidence;
                    } else {
                        updatedEvidences.push(newEvidence);
                    }

                    setEvidences(updatedEvidences);

                    // Pasar a la siguiente evidencia si no hemos alcanzado el máximo
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
                // No pedimos base64 aquí porque lo procesaremos después
                base64: false,
                // Calidad inicial (se mejorará con el procesamiento)
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
                // No pedimos base64 aquí porque lo procesaremos después
                base64: false,
                // Calidad inicial (se mejorará con el procesamiento)
                quality: 0.8,
                // Opcional: permitir seleccionar solo imágenes
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

        // Ajustar el índice actual si es necesario
        if (currentEvidenceIndex >= updatedEvidences.length && updatedEvidences.length > 0) {
            setCurrentEvidenceIndex(updatedEvidences.length - 1);
        }
    };

    // === CONTINUAR CON EVIDENCIAS ===
    const handleContinue = () => {
        onEvidenceComplete?.(evidences);
    };

    // === SELECCIONAR EVIDENCIA PARA EDITAR ===
    const handleSelectEvidence = (index: number) => {
        setCurrentEvidenceIndex(index);
    };

    const validateCodeOTP = async () => {
        try {
            setLoading(true);

            if (isOtpComplete && multiplePhotos && multiplePhotos.length > 0) {

                const validBase64 = multiplePhotos
                    .filter(photo => photo.base64 && photo.base64.trim() !== '')
                    .map(photo => photo.base64!);

                const responseData = await detailsRepositoryImpl.dataUploadFIle(
                    {
                        direccion_id: Number(guide?.idDireccion),
                        files: validBase64,
                        numero_factura: String(guide?.facturas[0]?.numeroFactura)
                    },
                    token
                );

                if (responseData?.statusCode === 200) {
                    if (isSelectInvocies) {
                        if (isAnticipe == 'true') {
                            router.push(
                                `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${'true'}&documentMeico=${guide?.facturas[0]?.numeroFactura}&routeStarted=${'true'}&isAnticipe=${'true'}&isCountryDelivery=${'true'}&isAnticipeInvoice=${'true'}`
                            );
                        } else {
                            router.push(
                                `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${'true'}&documentMeico=${guide?.facturas[0]?.numeroFactura}&routeStarted=${'true'}`
                            );
                        }
                    } else {
                        const response = await invoiceRepositoryImpl.closeAddresses(
                            guide?.idDireccion || 0,
                            token
                        );
                        if (response?.statusCode === 200) {
                            router.push(
                                `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
                            );
                        } else {
                            setShowErrorQRP(true);
                            setShowErrorQRPMessage(response?.message || "Ocurrio un error inesperado");
                            return
                        }

                    }
                } else {
                    setShowErrorQRP(true);
                    setShowErrorQRPMessage(responseData?.message || "Código OTP incorrecto");
                    return
                }
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const isOtpComplete = evidences.length > 0;

    return (
        <ThemedView style={styles.mainContainer}>
           <NetworkStatus /> 

            {/* Header con título */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmación de entrega</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Contenido principal */}
            <View style={styles.contentContainer}>
                <View style={styles.otpContainerTwo}>
                    <Text style={styles.otpTitle}>
                        Validacion con captura de imagen
                    </Text>
                </View>
                {/* Miniaturas de evidencias cargadas - UNA DEBAJO DE OTRA */}
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

                                    {/* Texto "Evidencia X" en el centro */}
                                    <Text style={styles.thumbnailLabel}>
                                        Evidencia {index + 1}
                                    </Text>

                                    {/* Icono de basura al otro extremo */}
                                    <TouchableOpacity
                                        style={styles.trashButton}
                                        onPress={() => {
                                            handleTakePhoto();
                                            handleRemoveEvidence(index)
                                        }}
                                        disabled={isLoading}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#141D32" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Mostrar loading para la próxima evidencia si se está cargando */}
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

            </View>
            <View style={[
                styles.buttonWrapper,
                keyboardVisible && { bottom: keyboardHeight + 60 }
            ]}>
                <PrimaryButton
                    title="Confirmar"
                    onPress={validateCodeOTP}
                    disabled={!isOtpComplete}
                    width={328}
                    height={43}
                />
            </View>

            {showErrorQRP && (
                <TopErrorAlert
                    visible={showErrorQRP}
                    message={showErrorQRPMessage}
                    onHide={() => setShowErrorQRP(false)}
                />
            )}

            {loading && <LoadingBlue />}

        </ThemedView>
    );
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9F9FA',
    },
    buttonWrapper: {
        position: 'absolute',
        bottom: 55,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 5,
        backgroundColor: '#F9F9FA',
        zIndex: 10,
    },
    otpTitle: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 20,
        lineHeight: 30,
        color: '#141D32',
        marginBottom: 12,
    },
    otpContainerTwo: {
        marginBottom: 20,
        alignItems: 'flex-start',
        width: '100%',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        backgroundColor: '#F9F9FA',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    backArrow: {
        fontSize: 40,
        color: '#000',
        fontWeight: '300',
        lineHeight: 32,
    },
    headerTitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 18,
        color: '#000',
        marginLeft: 0,
    },
    placeholder: {
        width: 40,
    },
    // Estilos para las evidencias (los que ya tenías)
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
    thumbnailImage: {
        width: 40,
        height: 40,
        borderRadius: 6,
    },
    thumbnailLabel: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "500",
        color: "#141D32",
        flex: 1,
        marginLeft: 12,
    },
    trashButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingIndicator: {
        padding: 8,
    },
    emptyThumbnail: {
        borderStyle: "dashed",
        borderWidth: 1,
        backgroundColor: "#F9F9FA",
    },
    emptyLabel: {
        color: "#788095",
    },
    trashButtonPlaceholder: {
        width: 40,
        height: 40,
    },
});