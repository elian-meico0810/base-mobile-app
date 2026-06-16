import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { ExceptionModal } from "@/components/generals/ExecptionModal";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { Row } from "@/components/generals/Row";
import { TypoPaymentEnum } from "@/src/constants/GuideStates";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { TypeParameterValue } from "../../domain/invoices/InvoicesInterFace";

const { width, height } = Dimensions.get('window');

interface Invoice {
    dfr: number;
    numeroFactura: string;
    valorRecaudar: number;
    valorTotal: number;
    condPago: string;
}

interface PaymentSelectionModalProps {
    data?: {
        facturas: Invoice[];
    };
    onClose: () => void;
    onChangePhone?: () => void;
    disabled?: boolean;
    phone?: string;
    onGenerateQR?: () => void;
    onPressPayment?: (
        payments: {
            tipo: TypoPaymentEnum;
            valor: number;
            descripcion: string;
        }[]
    ) => void;
    onErrorPayment?: (error: any) => void;
    statusTypeQR?: string;
    totalRecauder?: number;
    toleranceMargin?: TypeParameterValue[];

}



export function PaymentSelectionModal({
    data,
    onClose,
    disabled,
    onPressPayment,
    onErrorPayment,
    totalRecauder,
    toleranceMargin
}: PaymentSelectionModalProps) {
    const [loading, setLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [showOther, setShowOther] = useState(false);
    const [cashAmount, setCashAmount] = useState('');
    const [otherAmount, setOtherAmount] = useState('');
    const [otherDescription, setOtherDescription] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const dataInvoice: Invoice = data?.facturas?.[0] ?? {
        dfr: 0,
        numeroFactura: "",
        valorRecaudar: 0,
        valorTotal: 0,
        condPago: "",
    };

    // Validaciones
    const hasCashAmount = Number(cashAmount) > 0;
    const hasOtherAmount = Number(otherAmount) > 0;
    const hasOtherDescription = otherDescription.trim().length > 0;

    const totalTolerance = (toleranceMargin ?? []).reduce((acc, item) => {
        const value = Number(item.valor);
        return !isNaN(value) ? acc + value : acc;
    }, 0);

    const totalWithTolerance = Number(totalRecauder) + totalTolerance;

    const isCashGreaterThanTotal = Number(cashAmount) > totalWithTolerance;
    const isOtherGreaterThanTotal = Number(otherAmount) > totalWithTolerance;
    
    const totalSum = Number(cashAmount) + Number(otherAmount);
    const isSumGreaterThanTotal = totalSum > totalWithTolerance && hasCashAmount && hasOtherAmount;
    
    const getExceedMessage = () => {
        if (isSumGreaterThanTotal) {
            return `La suma de efectivo (${formatCOP(cashAmount)}) y otros medios (${formatCOP(otherAmount)}) es ${formatCOP(totalSum)} no puede ser mayor al valor a pagar.`;
        }
        if (isCashGreaterThanTotal) {
            return `El monto en efectivo (${formatCOP(cashAmount)}) no puede ser mayor al valor a pagar (${formatCOP(totalWithTolerance)}).`;
        }
        if (isOtherGreaterThanTotal) {
            return `El monto en otros medios de pago (${formatCOP(otherAmount)}) no puede ser mayor al valor a pagar (${formatCOP(totalWithTolerance)}).`;
        }
        return "";
    };

    let isValidPayment = false;
    
    if (hasCashAmount && !hasOtherAmount) {
        isValidPayment = !isCashGreaterThanTotal;
    }
    else if (!hasCashAmount && hasOtherAmount) {
        isValidPayment = !isOtherGreaterThanTotal && hasOtherDescription;
    }
    else if (hasCashAmount && hasOtherAmount) {
        isValidPayment = !isSumGreaterThanTotal && hasOtherDescription;
    }

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
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

    const handleConfirmPayment = async () => {
        try {
            setLoading(true);

            // Validaciones
            if (!hasCashAmount && !hasOtherAmount) {
                setModalTitle("¡Alerta!");
                setModalMessage(
                    "Debe ingresar al menos un monto en efectivo o en otros medios de pago."
                );
                setModalVisible(true);
                return;
            }

            if (hasCashAmount && hasOtherAmount && isSumGreaterThanTotal) {
                setModalTitle("¡Alerta!");
                setModalMessage(getExceedMessage());
                setModalVisible(true);
                return;
            }

            if (hasCashAmount && isCashGreaterThanTotal) {
                setModalTitle("¡Alerta!");
                setModalMessage(getExceedMessage());
                setModalVisible(true);
                return;
            }

            if (hasOtherAmount && isOtherGreaterThanTotal) {
                setModalTitle("¡Alerta!");
                setModalMessage(getExceedMessage());
                setModalVisible(true);
                return;
            }

            if (hasOtherAmount && !hasOtherDescription) {
                setModalTitle("¡Alerta!");
                setModalMessage(
                    "Si ingresó un monto en 'Otros', debe proporcionar una descripción del pago."
                );
                setModalVisible(true);
                return;
            }

            const payments = [];

            if (hasCashAmount) {
                payments.push({
                    tipo: TypoPaymentEnum.EFECTY,
                    valor: Number(cashAmount),
                    descripcion: "",
                });
            }

            if (hasOtherAmount) {
                payments.push({
                    tipo: TypoPaymentEnum.OTHERS,
                    valor: Number(otherAmount),
                    descripcion: otherDescription,
                });
            }

            if (onPressPayment) {
                await onPressPayment(payments);
            }

            onClose?.();

        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(
                error?.data?.message ?? "Ocurrió un error inesperado."
            );
            setModalVisible(true);

            onErrorPayment?.(error);

        } finally {
            setLoading(false);
        }
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

    return (
        <View style={styles.overlay}>
            <TouchableOpacity
                style={styles.backgroundOverlay}
                activeOpacity={1}
                onPress={onClose}
            />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            width: width,
                        }
                    ]}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.closeText}>X</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.title}>Registrar Pago</Text>
                        <Text style={styles.description}>
                            Ingresa la información del pago recibido.
                        </Text>

                        <View style={styles.box}>
                            <Row label="N° de factura" value={dataInvoice.numeroFactura} />
                            <Row bold label="Valor a pagar" value={`${formatCOP(totalRecauder?.toString() || "0")}`} />
                        </View>

                        {/* Efectivo - Siempre visible */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Efectivo</Text>
                            <View style={[
                                styles.amountRow,
                                (isCashGreaterThanTotal || (hasOtherAmount && isSumGreaterThanTotal)) && styles.amountRowError
                            ]}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    keyboardType="number-pad"
                                    value={cashAmount ? formatCOP(cashAmount).replace('$', '') : ''}
                                    onChangeText={(text) => {
                                        const onlyNumbers = text.replace(/[^0-9]/g, '');
                                        setCashAmount(onlyNumbers);
                                    }}
                                    placeholderTextColor="#DDDFE8"
                                    onFocus={() => {
                                        setTimeout(() => {
                                            scrollViewRef.current?.scrollToEnd({ animated: true });
                                        }, 100);
                                    }}
                                />
                                {(isCashGreaterThanTotal || (hasOtherAmount && isSumGreaterThanTotal)) && (
                                    <Text style={styles.warningIcon}>⚠</Text>
                                )}
                            </View>
                            {isCashGreaterThanTotal && (
                                <Text style={styles.warningText}>
                                    El valor ingresado es mayor al valor a pagar
                                </Text>
                            )}
                            {hasOtherAmount && isSumGreaterThanTotal && !isCashGreaterThanTotal && (
                                <Text style={styles.warningText}>
                                    La suma con otros medios excede el total permitido
                                </Text>
                            )}
                        </View>

                        {/* Botón desplegable de Otros */}
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => setShowOther(!showOther)}
                        >
                            <Text style={styles.sectionTitle}>Otros</Text>
                            <Text style={styles.arrow}>
                                {showOther ? '⌃' : '⌄'}
                            </Text>
                        </TouchableOpacity>

                        {/* Mostrar campos de Otros solo si está desplegado */}
                        {showOther && (
                            <>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Monto del pago</Text>
                                    <View style={[
                                        styles.amountRow,
                                        (isOtherGreaterThanTotal || (hasCashAmount && isSumGreaterThanTotal)) && styles.amountRowError
                                    ]}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={styles.amountInput}
                                            keyboardType="number-pad"
                                            value={otherAmount ? formatCOP(otherAmount).replace('$', '') : ''}
                                            onChangeText={(text) => {
                                                const onlyNumbers = text.replace(/[^0-9]/g, '');
                                                setOtherAmount(onlyNumbers);
                                            }}
                                            placeholderTextColor="#DDDFE8"
                                            onFocus={() => {
                                                setTimeout(() => {
                                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                                }, 100);
                                            }}
                                        />
                                        {(isOtherGreaterThanTotal || (hasCashAmount && isSumGreaterThanTotal)) && (
                                            <Text style={styles.warningIcon}>⚠</Text>
                                        )}
                                    </View>
                                    {isOtherGreaterThanTotal && (
                                        <Text style={styles.warningText}>
                                            El valor ingresado es mayor al valor a pagar
                                        </Text>
                                    )}
                                    {hasCashAmount && isSumGreaterThanTotal && !isOtherGreaterThanTotal && (
                                        <Text style={styles.warningText}>
                                            La suma con efectivo excede el total permitido
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabelDescription}>Descripción del pago</Text>
                                    <View style={styles.descriptionContainer}>
                                        <TextInput
                                            style={styles.descriptionInput}
                                            keyboardType="default"
                                            value={otherDescription}
                                            onChangeText={setOtherDescription}
                                            placeholder="Describe cómo realizó el pago el cliente"
                                            placeholderTextColor="#DDDFE8"
                                            multiline={true}
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            maxLength={100}
                                            onFocus={() => {
                                                setTimeout(() => {
                                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                                }, 100);
                                            }}
                                        />
                                        {otherDescription.length > 0 && (
                                            <Text style={styles.charCount}>
                                                {otherDescription.length}/100
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </ScrollView>

                    {/* Botón fijo fuera del ScrollView */}
                    <View
                        style={[
                            styles.fixedButtonContainer,
                            {
                                paddingBottom: keyboardHeight > 0
                                    ? keyboardHeight + 20
                                    : 20
                            }
                        ]}
                    >
                        <PrimaryButton
                            title="Confirmar pago"
                            onPress={handleConfirmPayment}
                            disabled={!isValidPayment}
                            width={width - 32}
                            height={48}
                        />
                    </View>

                    <ExceptionModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title={modalTitle}
                        message={modalMessage}
                        buttonLabel="Entendido"
                    />
                </Animated.View>
            </SafeAreaView>

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
        zIndex: 9999,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    safeArea: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 0,
        maxHeight: '100%',
        minHeight: '60%',
    },
    closeButton: {
        position: "absolute",
        right: 8,
        top: 10,
        zIndex: 1000,
    },
    closeText: {
        fontSize: 18,
        color: "#788095",
        fontWeight: "bold",
    },
    scrollView: {
        width: '100%',
    },
    scrollContent: {
        paddingBottom: 50,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 20,
        color: "#141D32",
        marginBottom: 4,
        marginTop: 8,
        paddingRight: 30,
    },
    description: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        color: "#788095",
        marginBottom: 20,
    },
    box: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: "#F0F1F5",
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontFamily: "Rubik",
        fontWeight: "500",
        fontSize: 14,
        color: "#141D32",
        marginBottom: 8,
    },
    inputLabelDescription: {
        fontFamily: "Rubik",
        fontWeight: "500",
        fontSize: 14,
        color: "#788095",
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 16,
        height: 42,
    },
    currencySymbol: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 18,
        color: "#141D32",
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 14,
        color: "#141D32",
        height: '100%',
        padding: 0,
    },
    descriptionContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingVertical: 12,
        minHeight: 40,
        position: 'relative',
    },
    descriptionInput: {
        flex: 1,
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        color: "#141D32",
        textAlignVertical: 'top',
        lineHeight: 20,
        paddingTop: 0,
        minHeight: 60,
    },
    charCount: {
        position: 'absolute',
        bottom: 8,
        right: 16,
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 12,
        color: "#788095",
    },
    sectionTitle: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 16,
        color: "#141D32",
    },
    dropdownHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 16,
    },
    arrow: {
        fontSize: 18,
        color: "#788095",
    },
    validationHint: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 12,
        color: "#FF6B6B",
        marginTop: 8,
        marginBottom: 8,
    },
    bottomSpacer: {
        height: 20,
    },
    fixedButtonContainer: {
        paddingTop: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#F0F1F5",
        backgroundColor: "#F9F9FA",
    },
    warningText: {
        color: "#FF4D4F",
        fontSize: 12,
        marginTop: 4,
        fontFamily: "Rubik",
        marginLeft: 4,
    },
    amountRowError: {
        borderColor: "#FF4D4F",
        borderWidth: 1,
    },
    warningIcon: {
        color: "#FF4D4F",
        fontSize: 18,
        marginLeft: 8,
    },
});