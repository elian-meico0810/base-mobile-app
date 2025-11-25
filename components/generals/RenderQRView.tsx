import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { SecondaryButton } from "../buttons/SecondaryButton";

interface Props {
    dataInvoice: any;
    phone?: string;
    onChangePhone?: () => void;
    qrType: string;
    qrData?: string;
    disabled?: boolean;
    handleSendWhatsApp: () => void;
    handleChangeQRType: () => void;
    styles: any;
    formatNumber: (value: number) => string;
    Row: any;
}

export default function RenderQRView({
    dataInvoice,
    phone,
    onChangePhone,
    qrType,
    qrData,
    disabled,
    handleSendWhatsApp,
    handleChangeQRType,
    styles,
    formatNumber,
    Row
}: Props) {
    return (
        <>
            <Text style={styles.title}>QR de pago</Text>

            {/* Detalles de la factura */}
            <View style={styles.box}>
                <Row label="N° de factura" value={dataInvoice.numeroFactura} />
                <Row label="Valor total" value={`$${formatNumber(dataInvoice.valorTotal)}`} />
                <Row bold label="Valor a pagar" value={`$${formatNumber(dataInvoice.valorRecaudar)}`} />
            </View>

            {/* Información del teléfono */}
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

            <Text style={styles.title}>QR Pasarela de Pago</Text>

            {/* Contenedor del QR */}
            <View style={styles.qrContainer}>
                <Text style={styles.qrTypeText}>QR {qrType}</Text>

                {qrData ? (
                    <Image
                        source={{
                            uri: qrData.startsWith("data:")
                                ? qrData
                                : `data:image/png;base64,${qrData}`
                        }}
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>
                            Código QR generado para {qrType}
                        </Text>
                        <Text style={styles.qrDescription}>
                            El QR se generará automáticamente
                        </Text>
                    </View>
                )}
            </View>

            {/* Botones */}
            <View style={styles.qrButtonsContainer}>
                <PrimaryButton
                    title="Enviar por Whatsapp"
                    onPress={handleSendWhatsApp}
                    disabled={disabled}
                    width={350}      
                    height={48}  
                />
                <SecondaryButton
                    title="Cambiar tipo de QR"
                    onPress={handleChangeQRType}
                    disabled={disabled}
                    width={350}
                    height={48}
                />

            </View>
        </>
    );
}
