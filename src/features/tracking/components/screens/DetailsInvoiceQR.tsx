import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { ExceptionModal } from "@/components/generals/ExecptionModal";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { Row } from "@/components/generals/Row";
import { ENV_DEV } from "@/src/constants/apiRoutes";
import { TypeQr } from "@/src/constants/GuideStates";
import { formatNumber } from "@/src/utils/uitls";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GuideDetails } from "../../domain/details/DetailsGuide";
import { invoiceRepositoryImpl } from "../../infrastructure/invoices/invoiceRepositoryImpl";

interface DetailsInvoiceQRProps {
    data?: GuideDetails;
    onClose: () => void;
    onChangePhone?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    phone?: string;
    onGenerateQR?: (qrType: string, qrBase64?: string) => void;
    onPressPayment: () => void;
    onErrorPayment?: () => void;

}

interface Invoice {
    dfr: number;
    numeroFactura: string;
    valorRecaudar: number;
    valorTotal: number;
}

export function DetailsInvoiceQR({ data, onClose, onChangePhone, disabled, width = 360, height = 300, phone, onGenerateQR, onPressPayment, onErrorPayment }: DetailsInvoiceQRProps) {
    const [loading, setLoading] = useState(false);
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

    const paymentGateway = async () => {
        try {
            if (!phone || !/^\d{10}$/.test(phone)) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe ingresar un número de teléfono válido de 10 dígitos.");
                setModalVisible(true);
                return;
            }

            setLoading(true);
            if (onGenerateQR) {
                onGenerateQR(TypeQr.PASARELA);
            }
            const response = await invoiceRepositoryImpl.sendPaymentGetway(
                {
                    documento: {
                        numero: String(dataInvoice?.numeroFactura),
                        codigoCliente: String(data?.codigoCliente),
                        tipoDocumento: "Factura",
                    },
                    linkFisico: false,
                    linkVirtual: true,
                },
                ENV_DEV.KEY_APP
            );
            if (response?.statusCode === 200) {
                setLoading(false);
                onPressPayment();
                onGenerateQR?.(TypeQr.PASARELA, response?.data?.linkPagoVirtual);
            } else {
                onErrorPayment?.();
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const generateQR = async () => {
        try {
            if (!phone || !/^\d{10}$/.test(phone)) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe ingresar un número de teléfono válido de 10 dígitos.");
                setModalVisible(true);
                return;
            }

            setLoading(true);
            if (onGenerateQR) {
                onGenerateQR(TypeQr.BANCARIA);
            }

            const response = await invoiceRepositoryImpl.generateQR(
                {
                    numdoc: String(dataInvoice?.numeroFactura),
                    tipodoc: 'TD_FACTURA',
                    cus_no: String(data?.codigoCliente),
                },
                ENV_DEV.KEY_APP
            );
            if (response?.statusCode === 200) {
                setLoading(false);
                onPressPayment();
                onGenerateQR?.(TypeQr.BANCARIA, response?.data?.qr);
            } else {
                onErrorPayment?.();
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.overlay} pointerEvents="box-none">

            {/* FONDO — SOLO CAPTURA TOQUES FUERA */}
            <TouchableOpacity
                style={styles.backgroundOverlay}
                onPress={onClose}
                activeOpacity={1}
            />

            {/* MODAL — NO ES BLOQUEADO POR EL FONDO */}
            <View style={[styles.container, { width }]} pointerEvents="box-none">

                {/* BOTÓN X */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>

                <Text style={styles.title}>QR de pago</Text>

                <View style={styles.box}>
                    <Row label="N° de factura" value={dataInvoice.numeroFactura} />
                    <Row label="Valor total" value={`$${formatNumber(dataInvoice.valorTotal)}`} />
                    <Row bold label="Valor a pagar" value={`$${formatNumber(dataInvoice.valorRecaudar)}`} />
                </View>

                <View style={styles.phoneContainer}>
                    <Text style={styles.phoneLabel}>N° de teléfono asociado</Text>
                    <Text style={styles.phoneDescription}>
                        Usaremos este número para enviarte el QR.
                    </Text>

                    <View style={styles.phoneRow}>
                        <TextInput
                            style={styles.phoneInput}
                            value={phone ?? ""}
                            editable={false}
                        />
                        <TouchableOpacity onPress={onChangePhone}>
                            <Text style={styles.phoneChange}>Cambiar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.QrTitle}>Generar QR de pago</Text>
                <View style={styles.buttonsContainer}>
                    <SecondaryButton
                        title="Pasarela de Pago"
                        onPress={paymentGateway}
                        disabled={disabled}
                        width={350}
                        height={43}
                    />

                    <SecondaryButton
                        title="Aplicación Bancaria"
                        onPress={generateQR}
                        disabled={disabled}
                        width={350}
                        height={43}
                    />
                </View>

                <ExceptionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalTitle}
                    message={modalMessage}
                    buttonLabel={modalButtonLabel}
                />
            </View>
            {loading && <LoadingBlue />}

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
        zIndex: 999,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1,
    },
    container: {
        height: 500,
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 24,
        zIndex: 2,
    },
    closeButton: {
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 3,
    },
    closeText: {
        fontSize: 16,
        color: "#788095",
        fontWeight: "bold",
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 20,
        color: "#141D32",
    },
    box: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
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
        top: 10,
    },
});
