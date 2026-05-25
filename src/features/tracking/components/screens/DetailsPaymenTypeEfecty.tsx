import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { ExceptionModal } from "@/components/generals/ExecptionModal";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { Row } from "@/components/generals/Row";
import { formatNumber } from "@/src/utils/uitls";
import { useEffect, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { GuideDetails } from "../../domain/details/DetailsGuide";
import { TypeParameterValue } from "../../domain/invoices/InvoicesInterFace";
interface DetailsPaymenTypeEfectyProps {
    data?: GuideDetails;
    onClose: () => void;
    onChangePhone?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    phone?: string;
    onGenerateQR?: (qrType: string, qrBase64?: string) => void;
    onPressPayment: (value: number) => void;
    onErrorPayment?: () => void;
    statusTypeQR?: boolean;
    totalRecauder?: number;
    toleranceMargin?: TypeParameterValue[];
}

interface Invoice {
    dfr: number;
    numeroFactura: string;
    condPago: string;
    valorRecaudar: number;
    valorTotal: number;
}

export function DetailsPaymenTypeEfecty({
    data,
    onClose,
    onChangePhone,
    disabled,
    width = 360,
    height = 300,
    phone,
    onGenerateQR,
    onPressPayment,
    onErrorPayment,
    statusTypeQR,
    totalRecauder,
    toleranceMargin
}: DetailsPaymenTypeEfectyProps) {
    const [loading, setLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [modalVisible, setModalVisible] = useState(false);
    const [valueSet, setValue] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const dataInvoice: Invoice = data?.facturas?.[0] ?? {
        dfr: 0,
        numeroFactura: "",
        valorRecaudar: 0,
        valorTotal: 0,
        condPago: "",
    };
    const isValidCashValue = Number(valueSet) > 0;
    const totalTolerance = (toleranceMargin ?? []).reduce((acc, item) => {
        const value = Number(item.valor);

        return !isNaN(value) ? acc + value : acc;
    }, 0);

    const totalWithTolerance = Number(totalRecauder) + totalTolerance;
    const isValidValue = Number(valueSet) > 0 && Number(valueSet) <= totalWithTolerance;

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const paymentGateway = async () => {
        try {
            if (isValidValue) {
                onPressPayment?.(Number(valueSet));
                onClose?.();
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (number: string) => {
        if (!number) return '';

        const num = parseInt(number, 10);
        if (isNaN(num)) return '';

        return num.toLocaleString('es-ES');
    };

    const formatCOP = (value: string | number) => {
        if (!value) return '';

        const number = Number(value);
        if (isNaN(number)) return '';

        return number.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    };
    const isGreaterThanTotal = Number(valueSet) > totalWithTolerance;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {/* FONDO — SOLO CAPTURA TOQUES FUERA */}
            <TouchableOpacity
                style={styles.backgroundOverlay}
                onPress={onClose}
                activeOpacity={1}
            />

            {/* CONTENIDO DEL MODAL CON ANIMACIÓN */}
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: width,
                        transform: [{
                            translateY: keyboardHeight > 0 ? -keyboardHeight : 0
                        }]
                    }
                ]}
                pointerEvents="box-none"
            >
                {/* BOTÓN X */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Efectivo</Text>
                <Text style={styles.phoneDescription}>
                    Ingresa la cantidad recibida en billetes.
                </Text>
                <View style={styles.box}>
                    <Row label="N° de factura" value={dataInvoice.numeroFactura} />
                    <Row bold label="Valor a pagar" value={`$${formatNumber(Number(totalRecauder))}`} />
                </View>

                <View style={styles.phoneContainer}>
                    <View
                        style={[
                            styles.phoneRow,
                            isGreaterThanTotal && styles.phoneRowError
                        ]}
                    >
                        <TextInput
                            style={styles.phoneInput}
                            keyboardType="number-pad"
                            value={formatCOP(valueSet)}
                            onChangeText={(text) => {
                                const onlyNumbers = text.replace(/[^0-9]/g, '');
                                setValue(onlyNumbers);
                            }}
                            editable={true}
                        />

                        {isGreaterThanTotal && (
                            <Text style={styles.warningIcon}>⚠</Text>
                        )}
                    </View>
                    {isGreaterThanTotal && (
                        <Text style={styles.warningText}>
                            El valor ingresado es mayor al valor a pagar
                        </Text>
                    )}
                </View>

                <View style={styles.buttonsContainer}>
                    <PrimaryButton
                        title="Confirmar"
                        onPress={paymentGateway}
                        disabled={!isValidValue}
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
            </Animated.View>

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
        height: 380,
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
        borderWidth: 1,
        borderColor: "#F0F1F5",
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
        marginTop: 10
    },
    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 44,
        marginTop: 4,
        borderColor: "#F0F1F5",
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
    warningText: {
        color: "#FF4D4F",
        fontSize: 12,
        marginTop: 4,
        fontFamily: "Rubik",
        marginLeft: 4,
    },
    phoneRowError: {
        borderColor: "#FF4D4F",
        borderWidth: 1,
    },
    warningIcon: {
        color: "#FF4D4F",
        fontSize: 18,
        marginLeft: 8,
    },
});