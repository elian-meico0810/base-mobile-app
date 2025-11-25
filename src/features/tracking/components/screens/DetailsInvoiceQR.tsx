import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { Row } from "@/components/generals/Row";
import { formatNumber } from "@/src/utils/uitls";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface DetailsInvoiceQRProps {
    data?: {
        facturas: Invoice[];
    };
    onClose: () => void;
    onChangePhone?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    phone?: string;
    onGenerateQR?: (qrType: string) => void; // Nueva prop callback

}

interface Invoice {
    dfr: number;
    numeroFactura: string;
    valorRecaudar: number;
    valorTotal: number;
}

export function DetailsInvoiceQR({ data, onClose, onChangePhone, disabled, width = 360, height = 300, phone, onGenerateQR }: DetailsInvoiceQRProps) {
    const [loading, setLoading] = useState(false);

    const dataInvoice: Invoice = data?.facturas?.[0] ?? {
        dfr: 0,
        numeroFactura: "",
        valorRecaudar: 0,
        valorTotal: 0
    };

    const paymentGateway = async () => {
        try {
            // setLoading(true);
            if (onGenerateQR) {
                onGenerateQR('Pasarela de Pago');
            }

            // const response = await detailsRepositoryImpl.sendPaymentGetway(
            //     {
            //         documento: '001',
            //         linkFisico: 'true',
            //         linkVirtual: 'true',
            //     },
            //     'token'
            // );
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);

        }
    };

    const generateQR = async () => {
        try {
            // setLoading(true);
            if (onGenerateQR) {
                onGenerateQR('Aplicación Bancaria');
            }
            // const response = await detailsRepositoryImpl.generateQR(
            //     {
            //         numdoc: '001',
            //         tipodoc: 'true',
            //         cus_no: 'true',
            //     },
            //     'token'
            // );
        } catch (error: any) {
            throw error;
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
                        height={48}
                    />

                    <SecondaryButton
                        title="Aplicación Bancaria"
                        onPress={generateQR}
                        disabled={disabled}
                        width={350}
                        height={48}
                    />
                </View>


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
