import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import InvoicesList from '@/src/features/tracking/components/tabs/InvoicesList';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { DerliveryDocument, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { cleanSpaces, getDeviceDateTime, getDistanceInMeters } from '@/src/utils/uitls';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface ViewSelectInvoiceProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    routeStartedBotton?: string;

}

export function ViewSelectInvoice({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, routeStartedBotton }: ViewSelectInvoiceProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [showPayment, setShowPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [conceptDelivery, setConceptDelivery] = useState<DerliveryDocument[]>([]);
    const [isValidData, setIsValidData] = useState(false);
    const [showPaymentPending, setShowPaymentPending] = useState(false);
    const [isEquals, setIsEquals] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState<Invoice | undefined>();
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [EntryVisible, setEntryVisible] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [validateIsBotton, setvalidateIsBotton] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<GuideDetails | null>(null);
    const [activeView, setActiveView] = useState(true);
    const [buttonValue, setButtonValue] = useState(false);
    const [allowBack, setAllowBack] = useState(false);
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

    const handleGoBack = () => {
        // router.back();
        router.push(
            `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
        );
    };


    useEffect(() => {
        if (token) {
            listGuideData();
        }
    }, [token]);

    useEffect(() => {
        if (guide?.fecha_apertura && !buttonValue) {
            listDocumentQuery();
            setButtonValue(true);
        }
    }, [token]);

    const handleInvoiceSelect = (selectedGuide: GuideDetails | null) => {
        try {
            setSelectedInvoice(selectedGuide);

            if (!routeStarted && !conditionButton && !buttonValue) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe confirmar que ya ha llegado a la dirección.");
                setModalVisible(true);
                return;
            }
            if (selectedInvoice) {
                router.push(
                    `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(selectedInvoice))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${'true'}`
                );
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            if (guide?.latitud && guide?.longitud) {
                const distance = getDistanceInMeters(Number(guide?.latitud), Number(guide?.longitud), Number(location.coords.latitude), Number(location.coords.longitude));
                const isInsideRange = distance <= 100;
                if (!isInsideRange) {
                    btnRef.current?.reset();
                    setModalTitle("¡Alerta!");
                    setModalMessage("Estás fuera del rango permitido de 100 metros.");
                    setModalVisible(true);
                }

            }

            const response = await invoiceRepositoryImpl.openAddresses(
                {
                    latitud: String(location.coords.latitude),
                    longitud: String(location.coords.longitude),
                    fechaHoraDispositivo: getDeviceDateTime()
                },
                guide?.idDireccion || 0,
                token
            );
            if (response?.statusCode === 200) {
                setvalidateIsBotton(true);
                setEntryVisible(true);
                setRouteStarted(true);
                setShowDetailInvoiceQR(false);
                setShowPayment(false);
            } else {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setValidateException(true);
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
            if (conceptDelivery?.length != guide?.facturas?.length) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar un estado de entrega.");
                setModalVisible(true);
                return;
            }
            if (!isEquals) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar los estados de entrega por factura.");
                setModalVisible(true);
                return;
            }
            setLoading(true);
            const response = await invoiceRepositoryImpl.closeAddresses(
                guide?.idDireccion || 0,
                token
            );
            if (response?.statusCode === 200) {
                setEntryVisible(true);
                setRouteStarted(true);
                router.push(
                    `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
                );
            } else {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const listGuideData = async () => {
        try {
            setLoading(true);
            const response = await detailsRepositoryImpl.listGuide(
                Number(numberGuide),
                token
            );
            if (response?.statusCode === 200 && response?.data && Array.isArray(response.data)) {
                const clienteFiltrado = response.data.filter(item =>
                    item.codigoCliente === guide?.codigoCliente
                );
                if (clienteFiltrado.length > 0) {
                    const clienteEncontrado = clienteFiltrado[0];

                    setGuide({
                        idDireccion: clienteEncontrado.idDireccion,
                        direccion: clienteEncontrado.direccion,
                        poblacion: clienteEncontrado.poblacion,
                        codigoCliente: clienteEncontrado.codigoCliente,
                        nombreCliente: clienteEncontrado.nombreCliente,
                        latitud: clienteEncontrado.latitud,
                        longitud: clienteEncontrado.longitud,
                        estado: clienteEncontrado.estado,
                        facturas: clienteEncontrado.facturas
                    });
                    listDocumentQuery();

                }
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const listDocumentQuery = async () => {
        try {
            setLoading(true);
            const responseQuery = await invoiceRepositoryImpl.listDocument(
                null,
                Number(guide?.idDireccion),
                token
            );
            let conceptList: DerliveryDocument[] = [];

            if (responseQuery?.statusCode === 200) {
                if (Array.isArray(responseQuery.data)) {
                    conceptList = responseQuery.data;
                } else if (responseQuery.data && typeof responseQuery.data === "object") {
                    conceptList = [responseQuery.data];
                } else {
                    conceptList = [];
                }
                const facturaNumbers = guide?.facturas?.map(f => f.numeroFactura) ?? [];
                const documentNumbers = conceptList.map(c => c.documentMeico);

                const isValid = facturaNumbers.every(numero =>
                    documentNumbers.includes(numero)
                );
                if (isValid) {
                    setIsValidData(true);
                }
                setConceptDelivery(conceptList)
                setLoading(false);
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
        if (conceptDelivery.length > 0 && guide) {
            const numerosFacturas = guide.facturas.map(factura => factura.numeroFactura);
            const documentosMeico = conceptDelivery.map(item => item.documentMeico);
            // Ordenar y comparar como strings
            numerosFacturas.sort();
            documentosMeico.sort();

            const equals = JSON.stringify(numerosFacturas) === JSON.stringify(documentosMeico);
            setIsEquals(equals)
        }
    }, [conceptDelivery, guide]);

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const respones = await invoiceRepositoryImpl.successfulBillPayment(
                    Number(initialGuide?.facturas[0]?.numeroFactura),
                    ENV_DEV.KEY_APP
                );
                if (respones?.statusCode === 200) {
                    setPaymentSuccessful(respones.data as Invoice);
                }
            } catch (error) {
                setModalTitle("¡Error!");
                setModalMessage("Ocurrio un error inesperado.");
                setModalVisible(true);
            } finally {
                setLoading(false);
            }
        };

        fetchGuide();
    }, [Number(initialGuide?.facturas[0]?.numeroFactura), token]);


    const totalAproved = paymentSuccessful?.pagos
        ?.filter(pago => pago.estado === "APPROVED")
        .reduce((sum, pago) => sum + (Number(pago?.valorPagado) || 0), 0) || 0;

    // Calcular la suma de todos los valorTotal y dfr de todas las facturas
    const totalFacturas = guide?.facturas?.reduce((sum, factura) => {
        const valorTotal = Number(factura?.valorTotal || 0);
        const dfr = Number(factura?.dfr || 0);
        return sum + (valorTotal - dfr);
    }, 0) || 0;

    const totalRecauder = Math.max(0, totalFacturas - totalAproved);
    const conditionButton = conceptDelivery.length != 0 || routeStarted;
    const validateCheckboxlength = conceptDelivery.length == guide?.facturas?.length
    const isSmallScreen = height <= 780;

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
            {(refreshing && RefreshingOnPress) && <LoadingSunburst />}

            {/* Alert de pago pendiente */}
            <View style={styles.paymentAlertContainer}>
                <PaymentPendingAlert
                    visible={RefreshingOnPress}
                    title="Pago pendiente"
                    subtitle="Después de realizar el pago, desliza hacia abajo para actualizar el estado."
                    onHide={() => setShowPaymentPending(false)}
                />
            </View>


            <ScrollView
                style={[styles.scrollView, { marginTop: RefreshingOnPress ? 90 : 8 }]}
                contentContainerStyle={[
                    styles.scrollContent,
                    // Ajustar el padding cuando no hay alerta
                ]}
                showsVerticalScrollIndicator={false}
            >

                {/* Card blanco centrado */}
                <View style={styles.card}>
                    {/* Encabezado */}
                    <View style={styles.cardHeader}>
                        <View
                            style={[
                                styles.statusContainer,
                                validateCheckboxlength && { backgroundColor: '#DFF5E1' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.status,
                                    validateCheckboxlength && { color: '#1F9144' },
                                ]}
                            >
                                {validateCheckboxlength ? 'Pedido entregado' : 'Pendiente'}
                            </Text>
                        </View>
                    </View>

                    {/* Información del minimercado */}
                    <View style={styles.merchantInfo}>
                        <Text style={styles.merchantName}>{guide?.nombreCliente ?? ''}</Text>
                        <Text style={styles.documentNumber}>{guide?.codigoCliente ?? '0'}</Text>
                        <Text style={styles.address}>{cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}</Text>
                    </View>

                    {/* Línea divisoria */}
                    <View style={styles.orderInfo}>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Ordenes a entregar</Text>
                            <Text style={styles.value}> {Number(guide?.facturas?.length) - Number(conceptDelivery.length)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.labelTotal}>Valor total del pedido</Text>
                            <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                                {
                                    '$ ' +
                                    guide?.facturas
                                        ?.reduce((sum, f) => sum + (f.valorRecaudar ?? 0), 0)
                                        .toLocaleString('es-CO', { minimumFractionDigits: 0 })
                                }
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Valor recaudado</Text>
                            <Text style={styles.value}>{'$ ' + Number(totalAproved || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>

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

                <View style={styles.headerContainerTwo}>
                    <Text style={styles.headerTitleTWO}>Ordenes a entregar</Text>
                </View>

                <View style={{ flex: 1, padding: 16 }}>
                    <InvoicesList guide={guide}
                        onInvoiceSelect={handleInvoiceSelect}
                        documentMeico={documentMeico}
                        numberGuide={numberGuide}
                        isSelectInvocies={isSelectInvocies}
                        token={token}
                        conceptDelivery={conceptDelivery}
                        activeView={activeView}
                    />
                </View>
            </ScrollView>
            {guide?.estado === 'Pendiente' && (
                <View style={[styles.redBackground, { height: isSmallScreen ? 60 : 90 }]} />
            )}

            <View style={[styles.footer, {
                marginBottom: isSmallScreen ? 0 : 10,
                bottom: isSmallScreen ? 10 : 40
            }]}>
                {guide?.estado === 'Pendiente' && (
                    <PrimaryButtonDetails
                        ref={btnRef}
                        autoReset={validateException}
                        key={conditionButton || buttonValue ? "cerrar" : "llegue"}
                        title={conditionButton || buttonValue ? "Cerrar pedido" : "Ya llegué"}
                        onPress={conditionButton || buttonValue ? submitData : handleSubmit}
                        disabled={false}
                        width={328}
                        height={43}
                        buttonColor={validateCheckboxlength ? undefined : conditionButton ? "#DDDFE8" : undefined}
                        buttonColorEnd={validateCheckboxlength ? undefined : conditionButton ? "#DDDFE8" : undefined}
                        titleColor={conditionButton ? "#FFFFFF" : undefined}
                        circleColor={validateCheckboxlength ? undefined : conditionButton ? "#788095" : undefined}
                    />
                )}
            </View>

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
        position: 'absolute',
    },
    background: {
        position: 'absolute',
        width: width,
        height: height,
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
        minHeight: 240,
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
    cardHeader: {
        alignItems: 'center',
        marginBottom: 4,
    },
    merchantInfo: {
        alignItems: 'center',
        marginBottom: 0,
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    documentNumber: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    address: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
        marginVertical: 2,
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
        fontSize: 12,
        color: '#141D32',
        flex: 1,
    },
    value: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        color: '#141D32',
        textAlign: 'right',
    },
    labelTotal: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 12,
        color: '#141D32',
        flex: 1,
    },
    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
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
    qrButtonDetail: {
        height: 32,
        backgroundColor: '#fffffffc',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
});

