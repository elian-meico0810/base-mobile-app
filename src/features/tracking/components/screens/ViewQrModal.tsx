import { ExceptionModal } from "@/components/generals/ExecptionModal";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import RenderQRView from "@/components/generals/RenderQRView";
import { Row } from "@/components/generals/Row";
import { TypeConPagoEnum } from "@/src/constants/GuideStates";
import { formatNumber } from "@/src/utils/uitls";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ViewQrModalQRProps {
    data?: {
        whatsapp?: string;
        facturas: Invoice[];
    };
    onClose: () => void;
    onChangePhone?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    qrHeight?: number;
    phone?: string;
    qrData?: string;
    qrType?: string;
    onSendWhatsApp?: () => void;
    onChangeQRType?: () => void;
    totalRecauder?: number;
}

interface Invoice {
    dfr: number;
    numeroFactura: string;
    valorRecaudar: number;
    valorTotal: number;
    condPago: string;
}

type ViewType = 'main' | 'qr';

export function ViewQrModal({
    data,
    onClose,
    onChangePhone,
    disabled,
    width = 360,
    height = 300,
    qrHeight = 300,
    phone,
    qrData,
    qrType = 'Aplicación Bancaria',
    onSendWhatsApp,
    onChangeQRType,
    totalRecauder
}: ViewQrModalQRProps) {
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>('main');
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [modalVisible, setModalVisible] = useState(false);
    const [localQRData, setLocalQRData] = useState(qrData);

    const dataInvoice: Invoice = data?.facturas?.[0] ?? {
        dfr: 0,
        numeroFactura: "",
        valorRecaudar: 0,
        valorTotal: 0,
        condPago: "",
    };

    const condPago = dataInvoice?.condPago == TypeConPagoEnum.TAT;
    const cleanWhatsapp = data?.whatsapp?.replace(/\D/g, '');

    const handleSendWhatsApp = () => {
        try {
            if ((!phone || !/^\d{10}$/.test(phone)) && Number(cleanWhatsapp?.length) != 10) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe ingresar un número de teléfono válido de 10 dígitos.");
                setModalVisible(true);
                return;
            }

            if (!qrData) {
                setModalTitle("Error al generar el QR");
                setModalMessage(
                    "No pudimos generar el código QR en este momento. Intenta nuevamente."
                );
                setModalVisible(true);
                return;
            }

            if (onSendWhatsApp && typeof onSendWhatsApp === 'function') {
                onSendWhatsApp();
            }
        } catch (error) {
            throw error;
        }
    };

    const handleChangeQRType = () => {
        if (onChangeQRType) {
            onChangeQRType();
        }
    };

    useEffect(() => {
        setLocalQRData(qrData);
    }, [qrData]);

    const dynamicStyles = {
        ...styles,
        qrContainer: {
            ...styles.qrContainer,
            height: qrHeight,
        },
    };
    console.log("qrData: ", qrData ? "Llego algo" : "No llego nada");

    return (
        <View style={styles.overlay}>
            {/* FONDO — captura toques fuera del modal */}
            <TouchableOpacity
                style={styles.backgroundOverlay}
                onPress={() => {
                    onClose();
                }}
                activeOpacity={1}
            />

            {/* MODAL */}
            <View style={[styles.container, { width: width, height: condPago ? 720 : 770 }]}>
                {/* BOTÓN X */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                        if (typeof onClose === "function") onClose();
                    }}
                >
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>

                {/* Renderizar contenido con los estilos dinámicos */}
                <RenderQRView
                    dataInvoice={dataInvoice}
                    phone={phone ? phone : data?.whatsapp?.replace(/\D/g, '') ?? ""}
                    onChangePhone={onChangePhone}
                    qrType={qrType}
                    qrData={qrData}
                    disabled={disabled}
                    handleSendWhatsApp={handleSendWhatsApp}
                    handleChangeQRType={handleChangeQRType}
                    styles={dynamicStyles}
                    formatNumber={formatNumber}
                    Row={Row}
                    totalRecauder={totalRecauder}
                />
            </View>

            {loading && <LoadingBlue />}
            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />
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
        backgroundColor: "transparent",
        zIndex: 9999,
        elevation: 9999,
        pointerEvents: "box-none",
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 0,
    },
    container: {
        height: 750,
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 24,
        zIndex: 10,
    },
    closeButton: {
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 10,
    },
    closeText: {
        fontSize: 16,
        color: "#788095",
        fontWeight: "bold",
        zIndex: 20,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 20,
        color: "#141D32",
        marginBottom: 10,
        top: 10,
    },
    box: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    phoneContainer: {
        marginTop: 20,
    },
    phoneLabel: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 14,
        color: "#141D32",
    },
    phoneDescription: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 12,
        color: "#788095",
        marginBottom: 8,
    },
    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        paddingHorizontal: 14,
        height: 44,
        marginTop: 4,
    },
    phoneInput: {
        flex: 1,
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 14,
        color: "#141D32",
    },
    phoneChange: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 14,
        color: "#164194",
    },
    buttonsContainer: {
    },
    button: {
        height: 48,
        borderWidth: 1,
        borderColor: "#164194",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#164194",
        fontWeight: "700",
    },
    QrTitle: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 20,
        color: "#141D32",
        marginTop: 20,
    },
    qrContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginTop: 2,
        alignItems: "center",
        justifyContent: "center",
        height: 300, // 👈 VALOR POR DEFECTO
    },
    qrTypeText: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 16,
        color: "#141D32",
        marginBottom: 16,
    },
    qrImage: {
        width: 180,
        height: 180,
        alignSelf: "center",
    },
    qrPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    qrPlaceholderText: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 14,
        color: "#141D32",
        textAlign: "center",
        marginBottom: 8,
    },
    qrDescription: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 12,
        color: "#788095",
        textAlign: "center",
    },
    qrButtonsContainer: {
        gap: 12,
    },
    whatsappButton: {
        height: 48,
        backgroundColor: "#25D366",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    whatsappButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    changeQRButton: {
        height: 48,
        borderWidth: 1,
        borderColor: "#164194",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    changeQRButtonText: {
        color: "#164194",
        fontWeight: "700",
        fontSize: 14,
    },
    bottomCenterText: {
        textAlign: "center",
        width: "100%",
        position: "static",
        color: "#788095",
    },
    errorContainer: {
        borderWidth: 1,
        borderColor: "#ff6b6b",
        borderRadius: 16,
        backgroundColor: "#fdf5f5",
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },

    errorIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: "#ef4444",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    errorIcon: {
        fontSize: 32,
        color: "#ef4444",
        fontWeight: "bold",
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 12,
    },
    errorDescription: {
        fontSize: 18,
        color: "#ef4444",
        textAlign: "center",
    },
    retryText: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: "600",
        color: "#ef4444",
        textDecorationLine: "underline",
    },
});