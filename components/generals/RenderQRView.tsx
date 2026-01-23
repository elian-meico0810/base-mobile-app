import { TypeConPagoEnum, TypeQr } from "@/src/constants/GuideStates";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
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
    totalRecauder?: number;
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
    totalRecauder
}: Props) {
    const [isQRGenerating, setIsQRGenerating] = useState(false);
    const [localQRData, setLocalQRData] = useState<string | undefined>(qrData);
    const [changingTypeLoading, setChangingTypeLoading] = useState(false);
    const [localPhone, setLocalPhone] = useState(phone ?? '');

    useEffect(() => {
        setLocalQRData(qrData);
    }, [qrData]);

    useEffect(() => {
        if (localQRData && qrType) {
            setIsQRGenerating(true);

            const timer = setTimeout(() => {
                setIsQRGenerating(false);
            }, 5000);

            return () => clearTimeout(timer);
        } else {
            setIsQRGenerating(false);
        }
    }, [localQRData, qrType]);

    const handleChangeTypeWithClean = () => {
        setLocalQRData(undefined);
        setIsQRGenerating(true);

        setTimeout(() => {
            handleChangeQRType();
        }, 100);
    };

    const getQRType = () => {
        if (!localQRData) return "empty";

        if (qrType === TypeQr.PASARELA && localQRData.startsWith("http")) {
            return "payment-link-to-qr";
        }

        // Base64
        const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(localQRData);
        if (isBase64) {
            try {
                const decoded = decodeBase64(localQRData);
                if (decoded.includes("<svg")) return "svg-base64";
            } catch (_) { }
        }

        // Si es URL
        if (localQRData.startsWith("http")) {
            if (localQRData.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                return "image-url";
            }
            return "payment-link";
        }

        if (localQRData.startsWith("data:image/")) return "base64-image";
        if (localQRData.length > 100) return "base64-raw-image";

        return "unknown";
    };

    const normalizeSvgSize = (svg: string) => {
        if (!svg.includes("viewBox")) {
            svg = svg.replace("<svg", `<svg viewBox="0 0 1024 1024"`);
        }

        svg = svg.replace(/width="[^"]*"/g, "");
        svg = svg.replace(/height="[^"]*"/g, "");

        return svg;
    };

    const condPago = dataInvoice?.condPago == TypeConPagoEnum.TAT;

    const renderQRContent = () => {
        const type = getQRType();

        if (isQRGenerating) {
            return (
                <View style={styles.qrPlaceholder}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.qrPlaceholderText}>
                        {type === "payment-link-to-qr" ? "Generando QR..." : "Cargando..."}
                    </Text>
                </View>
            );
        }

        switch (type) {
            case "empty":
                return (
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>Generando código QR...</Text>
                    </View>
                );

            case "payment-link-to-qr":
                return (
                    <View style={styles.qrContainer}>
                        <Text style={styles.qrDescription}>Escanea este QR para ir al portal de pago</Text>
                        <QRCode
                            value={localQRData}
                            size={200}
                            backgroundColor="white"
                            color="black"
                        />
                        <TouchableOpacity
                            style={styles.linkContainer}
                            onPress={() => localQRData && Linking.openURL(localQRData)}
                        >
                            <Text style={styles.linkUrl}>Abrir link directamente</Text>
                        </TouchableOpacity>
                    </View>
                );

            case "svg-base64": {
                let svgDecoded = decodeBase64(localQRData!);
                const svgNormalized = normalizeSvgSize(svgDecoded);
                return (
                    <View style={styles.svgContainer}>
                        <SvgXml xml={svgNormalized} width={200} height={300} />
                    </View>
                );
            }

            case "image-url":
                return <Image source={{ uri: localQRData }} style={styles.qrImage} resizeMode="contain" />;


            case "base64-image":
                return <Image source={{ uri: localQRData }} style={styles.qrImage} resizeMode="contain" />;

            case "base64-raw-image":
                return (
                    <Image
                        source={{ uri: `data:image/png;base64,${localQRData}` }}
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                );

            default:
                return (
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>Generando código QR...</Text>
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
                <Row bold label="Valor a pagar" value={`$${formatNumber(Number(totalRecauder))}`} />
            </View>

            {/* Teléfono */}
            <View style={styles.phoneContainer}>
                <Text style={styles.phoneLabel}>N° de teléfono asociado</Text>
                <Text style={styles.phoneDescription}>Usaremos este número para enviarte el QR.</Text>

                <View style={styles.phoneRow}>
                    <TextInput style={styles.phoneInput} value={phone ?? ""} editable={false} />
                    <TouchableOpacity
                        onPress={onChangePhone}
                    >
                        <Text style={styles.phoneChange}>Cambiar</Text>
                    </TouchableOpacity>
                </View>
            </View >

            <Text style={styles.title}>QR {qrType}</Text>
            {/* 
            {
                phone ? ( */}
            {/* <> */}
            <View style={styles.qrContainer}>
                {renderQRContent()}
            </View>

            {/* Botones */}
            <View style={styles.qrButtonsContainer}>
                <PrimaryButton
                    title="Enviar por Whatsapp"
                    onPress={handleSendWhatsApp}
                    disabled={disabled || !localQRData || isQRGenerating || phone ? false : true}
                    width={350}
                    height={43}
                />

                {!condPago && (
                    <SecondaryButton
                        title="Cambiar tipo de QR"
                        onPress={handleChangeTypeWithClean}
                        disabled={disabled || isQRGenerating}
                        width={350}
                        height={43}
                    />
                )}
            </View>
        </>
        //     ) : (
        //         <Text style={styles.bottomCenterText}>
        //             Por favor, ingrese un número de teléfono.
        //         </Text>
        //     )
        // }



        // </>
    );
}