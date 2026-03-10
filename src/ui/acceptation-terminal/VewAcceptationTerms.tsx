import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { OrderDetailSkeleton } from '@/components/skeleton/OrderDetailSkeleton ';
import { ThemedView } from '@/components/themed-view';
import { TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';

import { capitalizeFirst, cleanSpaces, toUpperCase } from '@/src/utils/uitls';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface InfoInvoiceFormProps {
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    IsGoBack?: boolean;
    routeStartedBotton?: string;
    detailsCounterDelivery?: boolean;
}

export function VewAcceptationTerms({  token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, isCountryDelivery = false, IsGoBack = false, routeStartedBotton, detailsCounterDelivery }: InfoInvoiceFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>();
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sasToken, setSasToken] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [allowBack, setAllowBack] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const btnRef = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        const backAction = () => {
            if (!allowBack) {
                router.push(`/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`);
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [allowBack, numberGuide, token]);

    const handleGoBack = async () => {
        router.back();

    };


    const handleSubmit = async () => {
        try {

        } catch (error: any) {
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const submitData = async () => {
        try {

        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const token = await SecureStore.getItemAsync("service_token");
            setSasToken(token || "");

        };
        init();

    }, []);

    const redirectContinue = async () => {
        try {

        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const totalAproved = 0;

    var value = '';
    switch (guide?.facturas[0]?.tipo) {
        case TypeInvoiceEnum.CONTADO_EFECTIVO:
            value = 'Contra-entrega';
            break;

        case TypeInvoiceEnum.CREDITO:
            value = 'Credito';
            break;

        case TypeInvoiceEnum.ANTICIPO:
            value = 'Anticipado';
            break;
    }

    const closeButton = routeStarted;


    const totalOrderPayment = Number(totalAproved) + Number(0);

    const totalValue =
        Number(
            (
                (Number(guide?.facturas[0]?.valorTotal) -
                    Number(guide?.facturas[0]?.dfr)) -
                Number(0)
            ).toFixed(2)
        );
    const totalRecauder = Math.max(0, Number(totalValue) - Number(totalOrderPayment));



    const handleSubmitConfirmation = async () => {
        try {
            if (!Number.isFinite(totalValue) || !Number.isFinite(totalRecauder)) {
                btnRef.current?.reset();
                setModalTitle("Cargando...");
                setModalMessage("Los valores aún no están listos, espere un momento.");
                setModalVisible(true);
                return;
            }
            if (Number(totalRecauder) > 0) {
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("El valor a recaudar debe ser 0 para continuar con la confirmación.");
                setModalVisible(true);
                return;
            }

            if (!guide?.whatsapp || guide?.whatsapp != "") {
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("El numero de telefono es requerido.");
                setModalVisible(true);
                return;
            }

            setLoading(true);

        } catch (error: any) {
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 222.");
            setModalVisible(true);
        }
    };
    const discount = Number(guide?.facturas[0]?.dfr ?? 0);
    const isZero = discount === 0;

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
                <Text style={styles.headerTitle}>Entrega de pedido</Text>
                <View style={styles.placeholder} />
            </View>
           
            {/* Card blanco centrado */}

            {!guide || !Number.isFinite(totalValue) || !Number.isFinite(totalRecauder) || !Number.isFinite(totalOrderPayment) ? (
                <OrderDetailSkeleton />
            ) : (
                <>
                    <View style={styles.card}>

                        {/* Línea divisoria */}
                        <View style={styles.orderInfo}>

                            <View style={styles.storeRow}>
                                <Image
                                    source={require("@/assets/icons/HouseIcon.png")}
                                    style={styles.storeIcon}
                                    resizeMode="contain"
                                />

                                <View style={styles.storeText}>
                                    <Text style={styles.labelTwo}>Nombre de la tienda</Text>
                                    <Text style={styles.value}>
                                        {toUpperCase(guide?.nombreCliente)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />
                            <View style={styles.storeRow}>
                                <Image
                                    source={require("@/assets/icons/UbicationIcon.png")}
                                    style={styles.storeIcon}
                                    resizeMode="contain"
                                />
                                <View style={styles.storeText}>
                                    <Text style={styles.labelTwo}>Dirección</Text>
                                    <Text style={styles.direccionText}>{cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.storeRow}>
                                <Image
                                    source={require("@/assets/icons/NumberIcon.png")}
                                    style={styles.storeIcon}
                                    resizeMode="contain"
                                />
                                <View style={styles.storeText}>
                                    <Text style={styles.labelTwo}>Código del cliente</Text>
                                    <Text style={styles.value}>
                                        {guide?.codigoCliente ?? '0'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.storeRow}>
                                <Image
                                    source={require("@/assets/icons/CashIcon.png")}
                                    style={styles.storeIcon}
                                    resizeMode="contain"
                                />
                                <View style={styles.storeText}>

                                    <Text style={styles.labelTwo}>Método de pago</Text>
                                    <Text style={styles.value}>
                                        {capitalizeFirst(value)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.storeRow}>
                                <Image
                                    source={require("@/assets/icons/InvoiceIcon.png")}
                                    style={styles.storeIcon}
                                    resizeMode="contain"
                                />
                                <View style={styles.storeText}>
                                    <Text style={styles.labelTwo}>N° de factura</Text>
                                    <Text style={styles.value}>{guide?.facturas[0]?.numeroFactura ?? '0'}</Text>
                                </View>

                            </View>
                        </View>
                    </View>

                    <View style={[styles.cardTwo, { minHeight: !closeButton ? undefined : 229 }]}>
                        {/* Encabezado */}
                        {(detailsCounterDelivery || closeButton) && (
                            <View style={styles.cardHeader}>
                                <View
                                    style={[
                                        styles.statusContainer,
                                        totalRecauder == 0 && { backgroundColor: '#DFF5E1' },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.status,
                                            totalRecauder == 0 && { color: '#1F9144' },
                                        ]}
                                    >
                                        {totalRecauder == 0 ? 'Pago realizado' : 'Pendiente'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Línea divisoria */}
                        <View style={styles.orderInfo}>

                            <View style={styles.row}>
                                <Text style={styles.label}>Subtotal</Text>
                                <Text style={styles.value}>{'$ ' + (Number(guide?.facturas[0]?.valorTotal) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Descuento financiero</Text>
                                <Text style={[
                                    styles.value,
                                    { color: isZero ? '#000000' : '#1F9144' }
                                ]}>
                                    {'$ ' + (isZero ? '' : '- ') + discount.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                </Text>
                            </View>
                            {(detailsCounterDelivery || closeButton) && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>Productos rechazados</Text>
                                    <Text style={styles.value}>{'$ ' + Number(0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                                </View>
                            )}
                            <View style={styles.row}>
                                <Text style={styles.labelTotal}>Valor total</Text>
                                <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                                    {'$ ' + Number(totalValue || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                </Text>
                            </View>

                            <View style={styles.dividerTwo} />

                            {/* Información del pedido */}
                            <View style={styles.row}>
                                <Text style={styles.label}>Valor recaudado</Text>
                                <Text style={styles.value}>{'$ ' + Number(totalOrderPayment || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.labelTotal}>Valor a recaudar</Text>
                                <Text style={[
                                    styles.value,
                                    {
                                        color: Number(totalRecauder) === 0 ? '#1F9144' : '#C62828',
                                        fontWeight: '800',
                                        fontSize: 16
                                    }
                                ]}>
                                    {'$ ' + (Number(totalRecauder) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                </Text>
                            </View>

                        </View>

                    </View>



                </>
            )}



            {guide && Number.isFinite(totalValue) && Number.isFinite(totalRecauder) && Number.isFinite(totalOrderPayment) && (

                <View style={[styles.footer, { marginBottom: 10 }]}>
                    <>
                        {routeStarted && isCountryDelivery ? (
                            <PrimaryButton
                                title="Continuar"
                                onPress={redirectContinue}
                                disabled={false}
                                width={328}
                                height={43}
                            />
                        ) : (
                            <PrimaryButtonDetails
                                ref={btnRef}
                                autoReset={validateException}
                                key={closeButton ? "cerrar" : "llegue"}
                                title={closeButton ? "Cerrar pedido" : "Ya llegué"}
                                onPress={closeButton ? submitData : handleSubmit}
                                disabled={false}
                                width={328}
                                height={43}
                                buttonColor={ closeButton ? "#DDDFE8" : undefined}
                                buttonColorEnd={ closeButton ? "#DDDFE8" : undefined}
                                titleColor={ closeButton ? "#FFFFFF" : undefined}
                                circleColor={ closeButton ? "#788095" : undefined}
                            />
                        )}
                    </>
                </View>
            )}
            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />

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
    background: {
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: '#F9F9FA',
    },
    icon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 5,
        backgroundColor: '#F9F9FA',
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
    paymentAlertContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    card: {
        width: 360,
        minHeight: 300,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 5,
        shadowColor: "#000",
        marginTop: 1,
    },
    cardTwo: {
        width: 360,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 5,
        shadowColor: "#000",
        marginTop: 10,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
        marginVertical: 2,
        marginTop: 12,

    },
    dividerTwo: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        borderStyle: 'dotted',
        width: '100%',
        marginVertical: 4,
    },
    orderInfo: {
        gap: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 14,
        color: '#141D32',
        flex: 1,
    },
    labelTwo: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        color: '#788095',
    },
    value: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        color: '#141D32',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    direccionText: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        color: '#141D32',
        alignItems: 'flex-start',
        overflow: 'hidden',
        flexWrap: 'wrap',
        flexShrink: 1,
        width: '100%',
        maxWidth: '100%',
    },
    labelTotal: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 14,
        color: '#141D32',
        flex: 1,
    },
    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 14,
        color: '#4F74C4',
    },
    statusContainer: {
        backgroundColor: '#E8EEF9',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: 73,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrButton: {
        height: 32,
        backgroundColor: '#E8EEF9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    qrButtonText: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 12,
        color: '#164194',
        textAlign: 'center',
    },
    qrButtonTexRed: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 12,
        color: '#C62828',
        textAlign: 'center',
    },
    qrButtonDetail: {
        height: 32,
        backgroundColor: '#fffffffc',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    qrButtonDetailTwo: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        borderRadius: 16,
        marginTop: 12,
    },

    footer: {
        position: 'absolute',
        bottom: 45,
        width: '100%',
        alignItems: 'center',
    },
    headerContainerTwo: {
        width: '100%',
        backgroundColor: '#F9F9FA',
        marginTop: 15,
        paddingLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitleTWO: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 18,
        color: '#000',
        marginLeft: 0,
    },
    qrButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrButtonIcon: {
        width: 16,
        height: 16,
    },
    scrollView: {
        flex: 1,
        width: '100%',
        marginTop: 100,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 100,
    },
    redBackground: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: "#F9F9FA",
        zIndex: 0,
    },
    storeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    storeIcon: {
        width: 24,
        height: 24,
    },
    storeText: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        flexShrink: 1,
    },
});

