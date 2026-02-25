import { createDataUri } from "@/src/utils/uitls";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    StyleSheet
} from "react-native";

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

interface UploadPhotoOTPProps {
    onClose?: () => void;
    onPick?: (data: { base64: string; uri: string }) => void;
    onPermisionsPhoto?: () => void;
}

export function UploadPhotoOTP({
    onClose,
    onPick,
    onPermisionsPhoto,
}: UploadPhotoOTPProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Configuración de redimensionamiento
    const IMAGE_CONFIG = {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.7,
    };

    // Abrir cámara automáticamente al montar el componente
    useEffect(() => {
        openCamera();
    }, []);

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

    // Función para abrir cámara y tomar foto
    const openCamera = async () => {
        // Solicitar permisos
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            onPermisionsPhoto?.();
            onClose?.();
            return;
        }

        setIsLoading(true);

        try {
            // Abrir cámara directamente
            const result = await ImagePicker.launchCameraAsync({
                base64: false,
                quality: 0.8,
                cameraType: ImagePicker.CameraType.back,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                
                // Procesar la imagen
                const processedImage = await processAndResizeImage(asset.uri);
                
                // Crear data URI
                const dataUri = createDataUri(processedImage.base64, processedImage.uri);

                // Enviar la imagen procesada
                onPick?.({
                    base64: dataUri,
                    uri: processedImage.uri
                });
            }
        } catch (error) {
            console.error("Error al tomar foto:", error);
        } finally {
            setIsLoading(false);
            // Cerrar el modal después de tomar la foto
            onClose?.();
        }
    };

    // Este componente no renderiza nada visible, solo abre la cámara
    return null;
}

// Estilos mínimos necesarios (opcional, puedes eliminarlos si no se usan)
const styles = StyleSheet.create({});