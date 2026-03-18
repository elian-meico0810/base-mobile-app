import { useState } from "react";
import {
    Dimensions,
    Modal, // Agregar Modal
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { SecondaryButtonCancel } from "../buttons/SecondaryButtonCancel";

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

interface ExcetptionModalProducts {
    title: string;
    subTitle: string;
    onClose?: () => void;
    width?: number;
    visible: boolean; // Agregar prop visible
    buttonLabel: string;
    onAccept?: () => void;
    onReject?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ExcetptionModalProducts({
    title,
    subTitle,
    onClose,
    width = 390,
    visible,
    buttonLabel,
    onAccept,
    onReject,
}: ExcetptionModalProducts) {
    const [isLoading, setIsLoading] = useState(false);

    // Limpiar evidencias cuando se cierra el modal
    const handleClose = () => {
        onClose?.();
    };

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

                    {/* <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity> */}

                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subTitleLabel}>{subTitle}</Text>


                        {/* Botón Continuar (solo visible con evidencias) */}
                        <View style={[styles.footer]}>
                            <>
                                <PrimaryButton
                                    title="Confirmar"
                                    onPress={() => {
                                        onAccept?.();
                                    }
                                    } disabled={false}
                                    width={348}
                                    height={43}
                                />

                                <SecondaryButtonCancel
                                    title="Rechazar"
                                    onPress={() => {
                                        onReject?.();
                                    }}
                                    disabled={false}
                                    width={348}
                                    height={43}
                                />
                            </>
                        </View>
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
        paddingTop: 12,
        paddingBottom: 60,
    },
    dragHandle: {
        alignSelf: "center",
        width: 40,
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
        lineHeight: 20,
        color: "#788095",
        marginBottom: 32,
        textAlign: "justify",
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
    footer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
});