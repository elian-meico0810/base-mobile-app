import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";

import { createDataUri } from "@/src/utils/uitls";
import {
    Image,
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

interface UploadPhotosProps {
    title: string;
    subTitle: string;
    onClose?: () => void;
    width?: number;
    onPick?: (data: { base64: string; uri: string }) => void;
    onEvidenceComplete?: (evidences: EvidencePhoto[]) => void;
    onPermisionsPhoto?: () => void;
    onPermisionsGallery?: () => void;
    maxEvidences?: number;
}


export function UploadPhoto({
    title,
    subTitle,
    onClose,
    width = 360,
    onPick,
    onEvidenceComplete,
    onPermisionsPhoto,
    onPermisionsGallery,
    maxEvidences = 3
}: UploadPhotosProps) {
    const [evidences, setEvidences] = useState<EvidencePhoto[]>([]);
    const [currentEvidenceIndex, setCurrentEvidenceIndex] = useState(0);

    // === TOMAR FOTO (CÁMARA) ===
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            onPermisionsPhoto?.();
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            base64: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            // Crear data URI con el formato correcto
            const dataUri = createDataUri(asset.base64!, asset.uri);

            const newEvidence: EvidencePhoto = {
                id: Date.now().toString(),
                uri: asset.uri,
                base64: dataUri, 
            };

            if (onPick) {
                // Modo simple: devuelve el data URI, no el base64 crudo
                onPick({
                    base64: dataUri, 
                    uri: asset.uri
                });
            } else {
                // Modo múltiples evidencias
                const updatedEvidences = [...evidences];

                // Reemplazar o agregar en la posición actual
                if (currentEvidenceIndex < updatedEvidences.length) {
                    updatedEvidences[currentEvidenceIndex] = newEvidence;
                } else {
                    updatedEvidences.push(newEvidence);
                }

                setEvidences(updatedEvidences);

                // Pasar a la siguiente evidencia si no hemos alcanzado el máximo
                if (currentEvidenceIndex < maxEvidences - 1 && updatedEvidences.length < maxEvidences) {
                    setCurrentEvidenceIndex(currentEvidenceIndex + 1);
                }
            }
        }
    };

    // === CARGAR FOTO (GALERIA) ===
    const handlePickGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            onPermisionsGallery?.();
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            // Crear data URI con el formato correcto
            const dataUri = createDataUri(asset.base64!, asset.uri);

            const newEvidence: EvidencePhoto = {
                id: Date.now().toString(),
                uri: asset.uri,
                base64: dataUri, 
            };

            if (onPick) {
                // Modo simple: devuelve el data URI, no el base64 crudo
                onPick({
                    base64: dataUri,
                    uri: asset.uri
                });
            } else {
                // Modo múltiples evidencias
                const updatedEvidences = [...evidences];

                // Reemplazar o agregar en la posición actual
                if (currentEvidenceIndex < updatedEvidences.length) {
                    updatedEvidences[currentEvidenceIndex] = newEvidence;
                } else {
                    updatedEvidences.push(newEvidence);
                }

                setEvidences(updatedEvidences);

                if (currentEvidenceIndex < maxEvidences - 1 && updatedEvidences.length < maxEvidences) {
                    setCurrentEvidenceIndex(currentEvidenceIndex + 1);
                }
            }
        }
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
        onClose?.();
    };

    // === SELECCIONAR EVIDENCIA PARA EDITAR ===
    const handleSelectEvidence = (index: number) => {
        setCurrentEvidenceIndex(index);
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backgroundOverlay} onPress={onClose} />

            <View style={[styles.container, { width }]}>
                <View style={[styles.track, { width }]} />

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subTitleLabel}>{subTitle}</Text>

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
                                    >
                                        <Image
                                            source={{ uri: evidence.uri }}
                                            style={styles.thumbnailImage}
                                        />
                                    </TouchableOpacity>

                                    {/* Texto "Evidencia X" en el centro */}
                                    <Text style={styles.thumbnailLabel}>Evidencia {index + 1}</Text>

                                    {/* Icono de basura al otro extremo */}
                                    <TouchableOpacity
                                        style={styles.trashButton}
                                        onPress={() => handleRemoveEvidence(index)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#141D32" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Espacios para evidencias faltantes - UNA DEBAJO DE OTRA */}
                            {Array.from({ length: maxEvidences - evidences.length }).map((_, index) => (
                                <View key={`empty-${index}`} style={styles.thumbnailRow}>
                                    <View style={[styles.thumbnailContainer, styles.emptyThumbnail]}>
                                        <Ionicons name="image-outline" size={16} color="#788095" />
                                    </View>
                                    <Text style={[styles.thumbnailLabel, styles.emptyLabel]}>
                                        Evidencia {evidences.length + index + 1}
                                    </Text>
                                    {/* Espacio vacío para mantener la alineación */}
                                    <View style={styles.trashButtonPlaceholder} />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 20 }} />

                {/*Tomar foto - SOLO SE MUESTRA SI HAY MENOS DE 3 IMÁGENES */}
                {evidences.length < maxEvidences && (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleTakePhoto}
                    >
                        <View style={styles.row}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="camera-outline" size={16} color="#141D32" />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Tomar foto</Text>
                                <Text style={styles.cardSub}>Captura una imagen en tiempo real</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* 🖼️ Adjuntar foto - SOLO SE MUESTRA SI HAY MENOS DE 3 IMÁGENES */}
                {evidences.length < maxEvidences && (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handlePickGallery}
                    >
                        <View style={styles.row}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="image-outline" size={16} color="#141D32" />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Adjuntar foto</Text>
                                <Text style={styles.cardSub}>Selecciona una imagen existente</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Botón Continuar (solo visible con evidencias) */}
                {evidences.length > 0 && (
                    <PrimaryButton
                        title="Continuar"
                        onPress={handleContinue}
                        disabled={false}
                        width={328}
                        height={43}
                    />
                )}
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
    // Estilos para miniaturas de evidencias - COLUMNA
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
    // Botón de basura (trash)
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
    // Indicador de evidencia actual
    currentEvidenceIndicator: {
        backgroundColor: "#E6E8EC",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    currentEvidenceText: {
        fontFamily: "Rubik",
        fontSize: 12,
        fontWeight: "600",
        color: "#141D32",
    },
    // Botones de acción
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
    // Botón continuar
    continueButton: {
        marginTop: 20,
        alignSelf: "center",
    },
});