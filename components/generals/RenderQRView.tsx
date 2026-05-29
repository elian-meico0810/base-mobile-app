import { TypeConPagoEnum, TypeQr } from "@/src/constants/GuideStates";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { WebView } from 'react-native-webview';
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
    totalRecauder,
}: Props) {
    const [isQRGenerating, setIsQRGenerating] = useState(true);
    const [changingTypeLoading, setChangingTypeLoading] = useState(false);
    const [localPhone, setLocalPhone] = useState(phone ?? '');
    const [pngBase64, setPngBase64] = useState<string | null>(null);
    const [svgBase64, setSvgBase64] = useState<string | null>(null);
    const size = Dimensions.get('window').width * 0.7;
    const [showError, setShowError] = useState(false);
    const [currentQRData, setCurrentQRData] = useState<string | undefined>(qrData);
    const [expectedQRType, setExpectedQRType] = useState<string>(qrType);

    useEffect(() => {
        if (expectedQRType !== qrType) {
            console.log("Tipo de QR cambiado de", expectedQRType, "a", qrType);
            setExpectedQRType(qrType);
            // Limpiar TODO inmediatamente
            setCurrentQRData(undefined);
            setSvgBase64(null);
            setPngBase64(null);
            setIsQRGenerating(true);
            setShowError(false);
            setChangingTypeLoading(true);
        }
    }, [qrType]);

    useEffect(() => {
        if (qrData) {
            const isValidForCurrentType = () => {
                if (qrType === TypeQr.PASARELA && qrData.startsWith("http")) {
                    return true;
                }
                if (qrType === TypeQr.BANCARIA && (qrData.includes("base64") || qrData.length > 100)) {
                    return true;
                }
                return false;
            };

            if (isValidForCurrentType()) {
                setCurrentQRData(qrData);
                setChangingTypeLoading(false);
            } else {
                setCurrentQRData(undefined);
                setChangingTypeLoading(false);
                return;
            }
        } else if (qrData === undefined && changingTypeLoading) {
            setCurrentQRData(undefined);
            setIsQRGenerating(true);
        }
    }, [qrData, qrType]);

    useEffect(() => {
        if (!currentQRData) {
            setIsQRGenerating(true);
            setShowError(false);

            const timer = setTimeout(() => {
                if (!currentQRData && !changingTypeLoading && qrType) {
                    console.log("Timeout: mostrando error");
                    setShowError(true);
                    setIsQRGenerating(false);
                }
            }, 8000);

            return () => clearTimeout(timer);
        }

        if (currentQRData) {
            setIsQRGenerating(true);
            setShowError(false);
            setChangingTypeLoading(false);

            const type = getQRTypeFromData(currentQRData);

            if (type === "svg-base64") {
                try {
                    const decoded = decodeBase64(currentQRData);
                    const svgNormalized = normalizeSvgSize(decoded);
                    setSvgBase64(svgNormalized);
                } catch (error) {
                    console.error("Error processing SVG:", error);
                }
            } else {
                setSvgBase64(null);
                setPngBase64(null);
            }

            const timer = setTimeout(() => {
                setIsQRGenerating(false);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [currentQRData]);

    const handleChangeTypeWithClean = () => {
        console.log("=== CAMBIANDO TIPO DE QR ===");
        console.log("Tipo actual:", qrType);

        // Limpiar TODO inmediatamente
        setSvgBase64(null);
        setPngBase64(null);
        setCurrentQRData(undefined);
        setIsQRGenerating(true);
        setShowError(false);
        setChangingTypeLoading(true);

        // Llamar al padre para cambiar el tipo
        handleChangeQRType();

        // No cerrar changingTypeLoading aquí, esperar a que llegue el nuevo QR válido
    };

    const getQRTypeFromData = (data: string | undefined) => {
        if (!data) return "empty";

        if (qrType === TypeQr.PASARELA && data.startsWith("http")) {
            return "payment-link-to-qr";
        }

        const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(data);
        if (isBase64) {
            try {
                const decoded = decodeBase64(data);
                if (decoded.includes("<svg")) return "svg-base64";
            } catch (_) { }
        }

        if (data.startsWith("http")) {
            if (data.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                return "image-url";
            }
            return "payment-link";
        }

        if (data.startsWith("data:image/")) return "base64-image";
        if (data.length > 100) return "base64-raw-image";

        return "unknown";
    };

    const getQRType = () => {
        return getQRTypeFromData(currentQRData);
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

    const handleRetry = () => {
        setShowError(false);
        setIsQRGenerating(true);
        setCurrentQRData(undefined);
        handleChangeQRType();
    };

    const renderQRContent = () => {
        const type = getQRType();

        if (showError) {
            return (
                <TouchableOpacity
                    style={styles.errorContainer}
                    onPress={handleRetry}
                    activeOpacity={0.8}
                >
                    <View style={styles.errorIconContainer}>
                        <Text style={styles.errorIcon}>✕</Text>
                    </View>

                    <Text style={styles.errorTitle}>
                        Intenta nuevamente.
                    </Text>

                    <Text style={styles.errorDescription}>
                        No pudimos generar el QR por fallas temporales en el servicio de {TypeQr.PASARELA == qrType ? 'Wompi' : 'Bancolombia'}.
                    </Text>

                    <Text style={styles.retryText}>
                        Toca aquí para reintentar
                    </Text>
                </TouchableOpacity>
            );
        }

        if (isQRGenerating || !currentQRData) {
            return (
                <View style={styles.qrPlaceholder}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.qrPlaceholderText}>
                        {changingTypeLoading ? "Cambiando tipo de QR..." :
                            !currentQRData ? "Cargando información de pago..." :
                                "Generando código QR..."}
                    </Text>
                </View>
            );
        }

        switch (type) {
            case "payment-link-to-qr":
                console.log("Renderizando payment-link-to-qr");
                return (
                    <View style={styles.qrContainer}>
                        <Text style={styles.qrDescription}>Escanea este QR para ir al portal de pago</Text>
                        <QRCode
                            value={currentQRData}
                            size={200}
                            backgroundColor="white"
                            color="black"
                        />
                        <TouchableOpacity
                            style={styles.linkContainer}
                            onPress={() => currentQRData && Linking.openURL(currentQRData)}
                        >
                            <Text style={styles.linkUrl}>Abrir link directamente</Text>
                        </TouchableOpacity>
                    </View>
                );

            case "svg-base64": {
                console.log("Renderizando svg-base64");
                if (!currentQRData) return null;
                let svgDecoded = decodeBase64(currentQRData);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgDecoded)}`;

                return (
                    <WebView
                        originWhitelist={['*']}
                        source={{
                            html: `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                                    <style>
                                        * {
                                            margin: 0;
                                            padding: 0;
                                            box-sizing: border-box;
                                        }
                                        body {
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            height: 100vh;
                                            background: white;
                                        }
                                        .qr-container {
                                            width: 100%;
                                            height: 100%;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        }
                                        img {
                                            max-width: 100%;
                                            max-height: 100%;
                                            object-fit: contain;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="qr-container">
                                        <img src="${svgDataUrl}" alt="QR Code" />
                                    </div>
                                </body>
                                </html>`
                        }}
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: 'white'
                        }}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                        )}
                    />
                );
            }

            case "image-url":
            case "base64-image":
                return <Image source={{ uri: currentQRData }} style={styles.qrImage} resizeMode="contain" />;

            case "base64-raw-image":
                return (
                    <Image
                        source={{ uri: `data:image/png;base64,${currentQRData}` }}
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                );

            default:
                return (
                    <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>Preparando código QR...</Text>
                    </View>
                );
        }
    };

    return (
        <>
            <Text style={styles.title}>QR de pago</Text>

            <View style={styles.box}>
                <Row label="N° de factura" value={dataInvoice.numeroFactura} />
                <Row label="Valor total" value={`$${formatNumber(dataInvoice.valorTotal)}`} />
                <Row bold label="Valor a pagar" value={`$${formatNumber(Number(totalRecauder))}`} />
            </View>

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

            <View style={styles.qrContainer}>
                {renderQRContent()}
            </View>

            <View style={styles.qrButtonsContainer}>
                <PrimaryButton
                    title="Enviar por Whatsapp"
                    onPress={handleSendWhatsApp}
                    disabled={disabled || !currentQRData || isQRGenerating || !phone}
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
    );
}