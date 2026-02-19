import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { ThemedView } from '@/components/themed-view';
import { GuideDetails, ResponseOTPInitPorps, ResponseOTPInitTwoPorps } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { formatTimeByMinutes } from '@/src/utils/uitls';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
    BackHandler,
    Dimensions,
    Image,
    Keyboard,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    TouchableOpacity,
    View
} from 'react-native';
const { width, height } = Dimensions.get('window');

interface ViewOTPCodeFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    IsGoBack?: boolean;
    routeStartedBotton?: string;
    responseOTPInit?: ResponseOTPInitPorps;
    totalRecauder?: number;
    totalValue?: number;
    totalOrderPayment?: number;
    expireDate?: boolean;
}

export function ViewOTPCodeForm({
    initialGuide,
    token = "",
    onSubmit,
    numberGuide,
    isSelectInvocies,
    documentMeico,
    isCountryDelivery = false,
    IsGoBack = false,
    routeStartedBotton,
    responseOTPInit,
    totalRecauder,
    totalValue,
    totalOrderPayment,
    expireDate
}: ViewOTPCodeFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [guideOTP, setGuideOTP] = useState<ResponseOTPInitPorps | undefined>(responseOTPInit);
    const [guideOTPTwo, setGuideOTPTwo] = useState<ResponseOTPInitTwoPorps | undefined>(responseOTPInit);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
    const [currentFocusIndex, setCurrentFocusIndex] = useState<number>(0);
    const [currentRemainingSeconds, setRemainingSeconds] = useState<number>(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [dataBack, setDataBack] = useState(false);
    const [showErrorQRP, setShowErrorQRP] = useState(false);
    const [showErrorQRPMessage, setShowErrorQRPMessage] = useState("Código OTP incorrecto");
    const [showErrorQRPMessageView, setShowErrorQRPMessageView] = useState("Código vencido");
    const [showViewError, setViewError] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number>(0);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [showViewAlert, setViewAlert] = useState(false);
    const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
    const [reentryPermission, setReentryPermission] = useState(2);
    const resendTimerRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const router = useRouter();
    const inputRefs = useRef<TextInput[]>([]);

    // Verificar si todos los campos OTP están llenos
    const isOtpComplete = otpValues.every(value => value !== "");

    // Efecto para escuchar cuando el teclado se muestra/oculta
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleGoBack = () => {
        // router.push(
        //     `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
        // );
    };


    // Función para manejar el clic en una caja
    const handleBoxPress = (index: number) => {
        // Buscar la primera caja vacía
        const firstEmptyIndex = otpValues.findIndex(value => value === "");

        // Si hay cajas vacías, enfocar la primera vacía
        if (firstEmptyIndex !== -1) {
            setCurrentFocusIndex(firstEmptyIndex);
            inputRefs.current[firstEmptyIndex]?.focus();
        } else {
            // Si todas están llenas, enfocar la última
            setCurrentFocusIndex(5);
            inputRefs.current[5]?.focus();
        }
    };

    // Función para manejar el cambio de texto en un input
    const handleTextChange = (text: string, index: number) => {
        // Solo aceptar números
        const numericText = text.replace(/[^0-9]/g, '');

        // Si se escribe más de un número, tomar solo el primero
        const newValue = numericText.length > 0 ? numericText[0] : "";

        // Actualizar el valor en la posición correspondiente
        const newOtpValues = [...otpValues];
        newOtpValues[index] = newValue;
        setOtpValues(newOtpValues);

        if (newValue !== "" && index < 5) {
            setCurrentFocusIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }

        if (newValue === "" && text === "" && index > 0) {
            setCurrentFocusIndex(index - 1);
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Función para manejar el borrado
    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            // Si el input actual está vacío y no es el primero, retroceder
            if (otpValues[index] === "" && index > 0) {
                setCurrentFocusIndex(index - 1);
                inputRefs.current[index - 1]?.focus();

                // Limpiar el input anterior
                const newOtpValues = [...otpValues];
                newOtpValues[index - 1] = "";
                setOtpValues(newOtpValues);
            }
        }
    };

    // Función para ocultar el teclado
    const dismissKeyboard = () => {
        Keyboard.dismiss();
        setCurrentFocusIndex(-1);
    };

    const validateCodeOTP = async () => {
        try {
            setLoading(true);
            const isOtpComplete = otpValues.every(value => value.trim() !== "");

            if (!isOtpComplete) {
                return;
            }
            const responseData = await detailsRepositoryImpl.validateCodeOTP(
                {
                    idDireccion: Number(guide?.idDireccion),
                    codigoOtp: otpValues.join(""),
                },
                token
            );
            if (responseData?.statusCode === 200) {
                setShowSuccess(true);
            } else {
                setShowErrorQRPMessage(responseData?.message || "Código OTP incorrecto");
                setShowErrorQRP(true);
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (
            guideOTP?.expiraEn &&
            guideOTP?.momentoEnvio &&
            !timerRef.current && !dataBack
        ) {
            const expira = new Date(guideOTP.expiraEn).getTime();
            const send = new Date(guideOTP.momentoEnvio).getTime();
            const time = Date.now();

            // Tiempo total del OTP
            const totalSeconds = Math.floor((expira - send) / 1000);

            // Tiempo restante real
            const remainingSeconds = Math.max(
                totalSeconds - Math.floor((time - send) / 1000),
                0
            );

            startOtpTimer(remainingSeconds);
            resendOtp();

        }
    }, [guideOTP]);


    const reentryCodeOTP = async () => {
        try {
            setLoading(true);

            // if (!guide?.whatsapp || guide?.whatsapp != "") {
            //     setModalTitle("¡Alerta!");
            //     setModalMessage("El numero de telefono es requerido.");
            //     setModalVisible(true);
            //     return;
            // }
            if (!Number.isFinite(totalValue) || !Number.isFinite(totalRecauder)) {
                setModalTitle("¡Alerta!");
                setModalMessage("Los valores aún no están listos. Intenta nuevamente.");
                setModalVisible(true);
                return;
            }

            const responseData = await detailsRepositoryImpl.reentryOTP(
                {
                    idDireccion: Number(guide?.idDireccion),
                    numeroFactura: String(guide?.facturas?.[0]?.numeroFactura),
                    // numeroDestino: "+57" + String(guide?.whatsapp).replace(/\D/g, ''),
                    numeroDestino: "+573112187956",
                    valorOriginal: String(totalValue),
                    valorPagado: String(totalOrderPayment),
                },
                token
            );

            if (responseData?.statusCode === 200) {
                setDataBack(true);
                resendOtp();
                setReentryPermission(2 - responseData?.data?.numeroReenvio)

                if (reentryPermission == 0) {
                    setResendDisabled(true);
                    setShowErrorQRPMessageView("OTP vencido o sin intentos.");
                    setViewAlert(true);
                }

                const expira = new Date(responseData.data.expiraEn).getTime();
                const send = new Date(responseData.data.momentoEnvio).getTime();
                const time = Date.now();

                // Tiempo total del OTP
                const totalSeconds = Math.floor((expira - send) / 1000);

                // Tiempo restante real
                const remainingSeconds = Math.max(
                    totalSeconds - Math.floor((time - send) / 1000),
                    0
                );

                startOtpTimer(remainingSeconds);
                // Ocultar teclado al confirmar
                dismissKeyboard();
            } else {
                if (reentryPermission == 0) {
                    setResendDisabled(true);
                    setShowErrorQRPMessageView("OTP vencido o sin intentos.");
                    setViewAlert(true);
                }
                setShowErrorQRPMessage(responseData?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setShowErrorQRP(true);
                if (reentryPermission == 0 && isExpired) {
                    setResendDisabled(true);
                }
                return;
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (
            guideOTP?.expiraEn &&
            guideOTP?.momentoEnvio &&
            !timerRef.current && !dataBack
        ) {
            
            const expira = new Date(guideOTP.expiraEn).getTime();
            const send = new Date(guideOTP.momentoEnvio).getTime();
            const time = Date.now();

            // Tiempo total del OTP
            const totalSeconds = Math.floor((expira - send) / 1000);

            // Tiempo restante real
            const remainingSeconds = Math.max(
                totalSeconds - Math.floor((time - send) / 1000),
                0
            );

            startOtpTimer(remainingSeconds);
            resendOtp();

        }
    }, [guideOTP]);


    useEffect(() => {
        if (
            guideOTPTwo?.expira_en &&
            guideOTPTwo?.momento_envio
        ) {
            setReentryPermission(
                2 - Number(guideOTPTwo?.numero_reenvio ?? 0)
            );

            const expira = new Date(guideOTPTwo.expira_en).getTime();
            const send = new Date(guideOTPTwo.momento_envio).getTime();
            const time = Date.now();

            // Tiempo total del OTP
            const totalSeconds = Math.floor((expira - send) / 1000);

            // Tiempo restante real
            const remainingSeconds = Math.max(
                totalSeconds - Math.floor((time - send) / 1000),
                0
            );
            setRemainingSeconds(remainingSeconds);
            startOtpTimer(remainingSeconds);
            resendOtp(true);

        }
    }, [guideOTPTwo]);

    const isExpired = secondsLeft <= 0;

    const startOtpTimer = (initialSeconds: number) => {
        setSecondsLeft(initialSeconds);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (initialSeconds <= 0) {
            return;
        }

        timerRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resendOtp = async (showViewAplication?: boolean) => {
        try {
            if (resendDisabled) return;
            // const isValid = validateOTP();
            // if (!isValid) return;
            if (!showViewAplication) {
                setResendDisabled(true);
                setResendSecondsLeft(30);
            }

            if (resendTimerRef.current) {
                clearInterval(resendTimerRef.current);
            }

            resendTimerRef.current = setInterval(() => {
                setResendSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(resendTimerRef.current!);
                        resendTimerRef.current = null;
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {

        }

    };

    useEffect(() => {
        if (isExpired) {
            setOtpValues(["", "", "", "", "", ""]);
        }
    }, [isExpired]);

    useEffect(() => {
        const backAction = () => {
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    return (
        <ThemedView style={styles.container}>
            {/* <NetworkStatus /> */}

            {/* Fondo gris */}
            <View style={styles.background} />

            {/* Header con título */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmación de entrega</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Contenido principal con espacio para el botón */}
            <View style={styles.contentContainer}>
                <View style={styles.otpContainerTwo}>
                    <Text style={styles.otpTitle}>
                        Ingresa el código OTP del cliente
                    </Text>

                    {reentryPermission > 0 ? (
                        <Text style={styles.otpSubtitle}>
                            Te quedan {reentryPermission} reenvíos
                        </Text>
                    ) : (
                        <Text style={styles.otpSubtitle}>
                            No te quedan reenvios.
                        </Text>
                    )}
                </View>

                <View style={styles.otpContainer}>

                    <View style={styles.otpInputsContainer}>
                        {[...Array(6)].map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.otpInputBox,
                                    otpValues[index] ? styles.otpInputBoxFilled : {},
                                    index === currentFocusIndex ? styles.otpInputBoxActive : {},
                                    isExpired ? styles.otpInputBoxDisabled : {},

                                ]}
                                onPress={() => handleBoxPress(index)}
                                activeOpacity={0.7}
                            >
                                {/* Input oculto para capturar el teclado */}
                                <TextInput
                                    ref={(ref) => {
                                        if (ref) {
                                            inputRefs.current[index] = ref;
                                        }
                                    }}
                                    style={[styles.hiddenInput,
                                    isExpired ? styles.otpInputTextDisabled : {},

                                    ]}
                                    value={otpValues[index]}
                                    onChangeText={(text) => handleTextChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus={true}
                                    onFocus={() => setCurrentFocusIndex(index)}
                                    onBlur={() => {
                                        // Solo quitar el foco si no es la primera vacía
                                        const firstEmptyIndex = otpValues.findIndex(value => value === "");
                                        if (firstEmptyIndex !== -1 && firstEmptyIndex !== index) {
                                            setCurrentFocusIndex(-1);
                                        }
                                    }}
                                    editable={isExpired ? false : true}

                                />

                                {/* Texto visible */}
                                <Text style={styles.otpInputText}>
                                    {otpValues[index] || " "}
                                </Text>

                                {/* Cursor parpadeante cuando está enfocado */}
                                {index === currentFocusIndex && (
                                    <View style={styles.cursor} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>


                    {!isExpired && (
                        <>

                            {/* Código vencerá */}
                            <View
                                style={styles.otpExpireContainer}
                            >
                                {!isExpired ? (
                                    <Image
                                        source={require("@/assets/icons/RelojIcon.png")}
                                        style={styles.icon}
                                    />
                                ) : (
                                    <Image
                                        source={require("@/assets/icons/RevertCode.png")}
                                        style={styles.icon}
                                    />
                                )
                                }

                                <Text style={styles.otpExpireText}>
                                    El código vencerá en {formatTimeByMinutes(secondsLeft)} min
                                </Text>
                            </View>

                        </>

                    )}

                    {showViewAlert && (
                        <View
                            style={styles.otpExpireContainerAlert}
                        >
                            <Image
                                source={require("@/assets/icons/ExistIcon.png")}
                                style={styles.icon}
                            />

                            <Text style={styles.otpExpireAlert}>
                                {showErrorQRPMessageView}
                            </Text>
                        </View>
                    )}

                    {/* Reenviar código */}
                    <TouchableOpacity
                        style={[
                            styles.resendContainer,
                            resendDisabled && styles.resendDisabled
                        ]}
                        activeOpacity={0.6}
                        disabled={resendDisabled}
                        onPress={reentryCodeOTP}
                    >
                        <Text style={styles.otpExpireIconText}>⟳</Text>
                        <Text style={styles.resendText}>Reenviar código OTP </Text>
                    </TouchableOpacity>


                    {/* {reentryPermission == 0 && (
                        <>
                            <View
                                style={styles.resendContainerCamera}
                            >
                                <Image
                                    source={require("@/assets/icons/CameraIcon.png")}
                                    style={styles.iconCamera}
                                />

                                <Text style={styles.resendText}>
                                    {"Validar con captura de imagen"}
                                </Text>
                            </View>
                        </>
                    )} */}
                </View>

                <View style={styles.spacer} />
            </View>

            <View style={[
                styles.buttonWrapper,
                keyboardVisible && { bottom: keyboardHeight + 60 }
            ]}>
                <PrimaryButton
                    title="Confirmar"
                    onPress={validateCodeOTP}
                    disabled={!isOtpComplete}
                    width={328}
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

            {showSuccess && (
                <TopSuccessAlert
                    visible={showSuccess}
                    message="Código OTP enviado"
                    onHide={() => setShowSuccess(false)}
                />
            )}

            {showErrorQRP && (
                <TopErrorAlert
                    visible={showErrorQRP}
                    message={showErrorQRPMessage}
                    onHide={() => setShowErrorQRP(false)}
                />
            )}

            {loading && <LoadingBlue />}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        alignItems: 'center',
    },
    otpInputBoxDisabled: {
        borderColor: '#F9F9FA',
        backgroundColor: '#F2F4F7',
    },
    otpInputTextDisabled: {
        color: '#788095',
    },
    icon: {
        width: 12,
        height: 12,
        marginRight: 4,
    },
    iconCamera: {
        width: 14,
        height: 14,
        marginRight: 4,
        resizeMode: 'contain',
    },
    resendDisabled: {
        opacity: 0.5,
    },
    background: {
        position: 'absolute',
        width: width,
        height: '100%',
        backgroundColor: '#F9F9FA',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 5,
        backgroundColor: '#F9F9FA',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    backArrow: {
        fontSize: 40,
        color: '#000',
        fontWeight: '300',
        lineHeight: 32,
    },
    headerTitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 18,
        color: '#000',
        marginLeft: 0,
    },
    placeholder: {
        width: 40,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    otpContainer: {
        marginTop: 10,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
    },
    otpContainerTwo: {
        marginTop: 20,
        alignItems: 'flex-start',
        width: '100%',
        paddingHorizontal: 20,
    },
    otpTitle: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 18,
        lineHeight: 20,
        color: '#141D32',
        marginBottom: 8,
    },
    otpSubtitle: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 14,
        color: '#788095',
        marginBottom: 24,
        textAlign: 'center',
    },
    otpInputsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    otpInputBox: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F1F5',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    otpInputBoxFilled: {
        borderColor: '#164194',
    },
    otpInputBoxActive: {
        borderColor: '#164194',
        borderWidth: 2,
    },
    otpInputText: {
        fontFamily: 'Rubik',
        color: '#141D32',
        fontSize: 18,
        fontWeight: '600',
    },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        fontSize: 1,
    },
    cursor: {
        position: 'absolute',
        bottom: 8,
        width: 1,
        height: 20,
        backgroundColor: '#141D32',
    },
    spacer: {
        flex: 1,
    },
    buttonWrapper: {
        position: 'absolute',
        bottom: 55,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    otpExpireContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        width: 202,
        height: 24,
        borderRadius: 100,
        paddingHorizontal: 8,
        backgroundColor: '#CCD0DA',
        marginTop: 16,
    },
    otpExpireContainerAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 24,
        borderRadius: 100,
        paddingHorizontal: 30,
        backgroundColor: '#FDEAEA',
        marginTop: 16,
    },
    otpExpireIcon: {
        fontSize: 18,
        lineHeight: 16,
        color: '#141D32',
    },
    otpExpireIconText: {
        fontSize: 20,
        lineHeight: 16,
        color: '#164194',
        fontWeight: '700',
    },
    otpExpireText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
    },
    resendContainer: {
        marginTop: 24,
        flexDirection: 'row',
        gap: 6,
    },
    resendContainerCamera: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    resendText: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        textAlign: 'center',
        color: '#164194',
    },
    otpExpireAlert: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: '#C62828',
    },
});