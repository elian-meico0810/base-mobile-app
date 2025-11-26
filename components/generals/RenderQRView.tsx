import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
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

// Decode base64 to text
const decodeBase64 = (base64: string) => {
    try {
        if (typeof atob !== "undefined") return atob(base64);
        return Buffer.from(base64, "base64").toString("utf-8");
    } catch (error) {
        console.log("Error decoding base64:", error);
        return base64;
    }
};

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
    Row,
}: Props) {

    const getQRType = () => {
        if (!qrData) return "empty";

        // Base64
        const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(qrData);
        if (isBase64) {
            try {
                const decoded = decodeBase64(qrData);
                if (decoded.includes("<svg")) return "svg-base64";
            } catch (_) { }
        }

        // Si es URL
        if (qrData.startsWith("http")) {
            if (qrData.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                return "image-url";
            }

            return "payment-link";
        }

        if (qrData.startsWith("data:image/")) return "base64-image";
        if (qrData.length > 100) return "base64-raw-image";

        return "unknown";
    };


    const normalizeSvgSize = (svg: string) => {
        // Si no tiene viewBox, lo agregamos
        if (!svg.includes("viewBox")) {
            svg = svg.replace("<svg", `<svg viewBox="0 0 1024 1024"`);
        }

        // ELIMINAR width y height del SVG para evitar distorsión
        svg = svg.replace(/width="[^"]*"/g, "");
        svg = svg.replace(/height="[^"]*"/g, "");

        return svg;
    };



    const renderQRContent = () => {
        const type = getQRType();

        switch (type) {
            case "empty":
                return (
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>Generando código QR...</Text>
                    </View>
                );

            case "svg-base64": {
                let svgDecoded = decodeBase64(qrData!);

                const svgNormalized = normalizeSvgSize(svgDecoded);

                return (
                    <View style={styles.svgContainer}>
                        <SvgXml xml={svgNormalized} width={200} height={300} />
                    </View>
                );
            }

            case "image-url":
                return <Image source={{ uri: qrData }} style={styles.qrImage} resizeMode="contain" />;

            case "base64-image":
                return <Image source={{ uri: qrData }} style={styles.qrImage} resizeMode="contain" />;

            case "base64-raw-image":
                return (
                    <Image
                        source={{ uri: `data:image/png;base64,${qrData}` }}
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                );

            default:
                return (
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>Formato QR no soportado</Text>
                        <Text style={styles.qrDescription}>
                            Longitud: {qrData?.length}
                        </Text>
                    </View>
                );
        }
    };
    return (
        <>
            <Text style={styles.title}>QR de pago</Text>

            {/* Detalles de la factura */}
            <View style={styles.box}>
                <Row label="N° de factura" value={dataInvoice.numeroFactura} />
                <Row label="Valor total" value={`$${formatNumber(dataInvoice.valorTotal)}`} />
                <Row bold label="Valor a pagar" value={`$${formatNumber(dataInvoice.valorRecaudar)}`} />
            </View>

            {/* Teléfono */}
            <View style={styles.phoneContainer}>
                <Text style={styles.phoneLabel}>N° de teléfono asociado</Text>
                <Text style={styles.phoneDescription}>Usaremos este número para enviarte el QR.</Text>

                <View style={styles.phoneRow}>
                    <TextInput style={styles.phoneInput} value={phone ?? ""} editable={false} />
                    <TouchableOpacity onPress={onChangePhone}>
                        <Text style={styles.phoneChange}>Cambiar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.title}>QR {qrType}</Text>

            {/* Contenedor QR */}
            <View style={styles.qrContainer}>{renderQRContent()}</View>

            {/* Botones */}
            <View style={styles.qrButtonsContainer}>
                <PrimaryButton
                    title="Enviar por Whatsapp"
                    onPress={handleSendWhatsApp}
                    disabled={disabled || !qrData}
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
