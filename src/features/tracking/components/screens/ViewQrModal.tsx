import { ExceptionModal } from "@/components/generals/ExecptionModal";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import RenderQRView from "@/components/generals/RenderQRView";
import { Row } from "@/components/generals/Row";
import { formatNumber } from "@/src/utils/uitls";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ViewQrModalQRProps {
    data?: {
        facturas: Invoice[];
    };
    onClose: () => void;
    onChangePhone?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    phone?: string;
    qrData?: string;
    qrType?: string;
    onSendWhatsApp?: () => void;
    onChangeQRType?: () => void;
}

interface Invoice {
    dfr: number;
    numeroFactura: string;
    valorRecaudar: number;
    valorTotal: number;
}

type ViewType = 'main' | 'qr';

export function ViewQrModal({
    data,
    onClose,
    onChangePhone,
    disabled,
    width = 360,
    height = 300,
    phone,
    qrData,
    qrType = 'Aplicación Bancaria',
    onSendWhatsApp,
    onChangeQRType
}: ViewQrModalQRProps) {
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>('main');
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [modalVisible, setModalVisible] = useState(false);

    const dataInvoice: Invoice = data?.facturas?.[0] ?? {
        dfr: 0,
        numeroFactura: "",
        valorRecaudar: 0,
        valorTotal: 0
    };

    const handleSendWhatsApp = () => {
        try {
            if (!phone || !/^\d{10}$/.test(phone)) {
                setModalTitle("Alerta !!");
                setModalMessage("Debe ingresar un número de teléfono válido de 10 dígitos.");
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

            {/* MODAL — ahora SIN pointerEvents="box-none" */}
            <View style={[styles.container, { width }]}>
                {/* BOTÓN X */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                        if (typeof onClose === "function") onClose();
                    }}
                >
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>


                {/* Renderizar contenido */}
                <RenderQRView
                    dataInvoice={dataInvoice}
                    phone={phone}
                    onChangePhone={onChangePhone}
                    qrType={qrType}
                    qrData={qrData}
                    disabled={disabled}
                    handleSendWhatsApp={handleSendWhatsApp}
                    handleChangeQRType={handleChangeQRType}
                    styles={styles}
                    formatNumber={formatNumber}
                    Row={Row}
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
        marginTop: 10,
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
        marginTop: 24,
        gap: 12,
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
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        height: 220,
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
        marginTop: 20,
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
});