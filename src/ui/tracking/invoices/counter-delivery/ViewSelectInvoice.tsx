import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { OrderDetailSkeletonSelect } from '@/components/skeleton/OrderDetailSkeletonSelect';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import { TipeCodeOTP, TypeInvoiceEnum } from '@/src/constants/GuideStates';
import InvoicesList from '@/src/features/tracking/components/tabs/InvoicesList';
import { GuideDetails, NovletyOrder } from '@/src/features/tracking/domain/details/DetailsGuide';
import { DerliveryDocument, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { cleanSpaces, getDeviceDateTime, getDistanceInMeters, heightCaldulate } from '@/src/utils/uitls';
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

export function ViewSelectInvoice({
    initialGuide,
    token = "",
    onSubmit,
    numberGuide,
    isSelectInvocies,
    documentMeico,
    routeStartedBotton
}: ViewSelectInvoiceProps) {
    const [guide, setGuide] = useState<GuideDetails>();
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [showPayment, setShowPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [conceptDelivery, setConceptDelivery] = useState<DerliveryDocument[]>([]);
    const [conceptDeliverySelect, setConceptDeliverySelect] = useState<NovletyOrder[]>([]);
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
    const [disabledInvoices, setDisabledInvoices] = useState<Set<string>>(new Set());
    const [disabledOTPInvoices, setDisabledOTPInvoices] = useState<Set<string>>(new Set());
    const [disabledFileInvoices, setDisabledFileInvoices] = useState<Set<string>>(new Set());
    const btnRef = useRef<any>(null);
    const router = useRouter();
    const heightValue = heightCaldulate();

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

    const listInfOTByDirection = async (data?: GuideDetails) => {
        try {

            if (!data?.facturas?.length) return;

            const disabledSet: Set<string> = new Set();

            for (const factura of data.facturas) {
                const numeroFactura = factura.numeroFactura;

                const response = await detailsRepositoryImpl.listInfOTP(
                    String(data?.idDireccion),
                    String(numeroFactura),
                    token
                );

                if (
                    response.success &&
                    response.data &&
                    typeof response.data !== "string" &&
                    !Array.isArray(response.data)
                ) {
                    if (response.data?.estado_envio && response.data.estado_envio === TipeCodeOTP.EST_OTP_VALIDADO) {
                        disabledSet.add(String(numeroFactura));
                    }
                }
            }
            setDisabledOTPInvoices(disabledSet);
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrió un error inesperado.");
            setModalVisible(true);
        }
    };


    const listInfOTPFileByDirection = async (data?: GuideDetails) => {
        try {

            if (!data?.facturas?.length) return;

            const disabledFileSet: Set<string> = new Set();

            for (const factura of data.facturas) {
                const numeroFactura = factura.numeroFactura;

                const response = await detailsRepositoryImpl.evidenciaOTPItem(
                    String(data?.idDireccion),
                    String(numeroFactura),
                    token
                );

                if (
                    response.success &&
                    Array.isArray(response.data) &&
                    response.data.length > 0
                ) {
                    disabledFileSet.add(String(numeroFactura));
                }
            }

            setDisabledFileInvoices(disabledFileSet);
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrió un error inesperado.");
            setModalVisible(true);
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
                    item.codigoCliente === initialGuide?.codigoCliente
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
                        fecha_apertura: clienteEncontrado.fecha_apertura,
                        facturas: clienteEncontrado.facturas,
                        pedidos: clienteEncontrado.pedidos,
                        whatsapp: clienteEncontrado.whatsapp,
                    });
                    listDocumentQuery(clienteEncontrado);
                    listInfOTByDirection({
                        idDireccion: clienteEncontrado.idDireccion,
                        direccion: clienteEncontrado.direccion,
                        poblacion: clienteEncontrado.poblacion,
                        codigoCliente: clienteEncontrado.codigoCliente,
                        nombreCliente: clienteEncontrado.nombreCliente,
                        latitud: clienteEncontrado.latitud,
                        longitud: clienteEncontrado.longitud,
                        estado: clienteEncontrado.estado,
                        fecha_apertura: clienteEncontrado.fecha_apertura,
                        facturas: clienteEncontrado.facturas,
                        pedidos: clienteEncontrado.pedidos,
                        whatsapp: clienteEncontrado.whatsapp,
                    });
                    listInfOTPFileByDirection({
                        idDireccion: clienteEncontrado.idDireccion,
                        direccion: clienteEncontrado.direccion,
                        poblacion: clienteEncontrado.poblacion,
                        codigoCliente: clienteEncontrado.codigoCliente,
                        nombreCliente: clienteEncontrado.nombreCliente,
                        latitud: clienteEncontrado.latitud,
                        longitud: clienteEncontrado.longitud,
                        estado: clienteEncontrado.estado,
                        fecha_apertura: clienteEncontrado.fecha_apertura,
                        facturas: clienteEncontrado.facturas,
                        pedidos: clienteEncontrado.pedidos,
                        whatsapp: clienteEncontrado.whatsapp,

                    })

                }
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        }
    };

    useEffect(() => {
        const merged = new Set<string>([
            ...disabledOTPInvoices,
            ...disabledFileInvoices
        ]);
        setDisabledInvoices(merged);
    }, [disabledOTPInvoices, disabledFileInvoices]);

    const listDocumentQuery = async (guide?: GuideDetails) => {
        try {

            if (guide?.pedidos && guide.pedidos.length > 0) {
                const ids = guide?.pedidos?.map(p => p.id).join(",") ?? "";

                setLoading(true);
                const response = await detailsRepositoryImpl.novletyOrderByids(
                    ids,
                    token
                )

                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    setConceptDeliverySelect(response.data)

                }
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
        if (!guide) {
            listGuideData();
        }
    }, []);

    useEffect(() => {
        if (conceptDeliverySelect?.length > (guide?.facturas?.length ?? 0)) {
            listDocumentQuery();
            listInfOTByDirection(initialGuide);
            listInfOTPFileByDirection(initialGuide);

        }
    }, [token]);

    const handleInvoiceSelect = (selectedGuide: GuideDetails | null) => {
        try {
            if (!selectedGuide) {
                setSelectedInvoice(null);
                return;
            }

            const facturas = selectedGuide.facturas || [];

            const orderFIlter = selectedGuide.pedidos?.filter(pedido =>
                facturas.some(factura =>
                    String(factura.numeroPedido) === String(pedido.codigo)
                )
            );

            const guideFilter = {
                ...selectedGuide,
                pedidos: orderFIlter
            };


            if (conceptDeliverySelect?.length == 0 && !guide?.fecha_apertura && !EntryVisible) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe confirmar que ya ha llegado a la dirección.");
                setModalVisible(true);
                return;
            }
            if (guideFilter) {

                switch (guideFilter.facturas?.[0].tipo) {
                    case TypeInvoiceEnum.CONTADO_EFECTIVO:
                        router.push(
                            `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guideFilter))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${'true'}`
                        );
                        break;
                    case TypeInvoiceEnum.CREDITO:
                        router.push({
                            pathname: '/views/indexInvoice',
                            params: {
                                guide: JSON.stringify(guideFilter),
                                numberGuide: numberGuide,
                                token: token ?? "",
                                totalValue: '0',
                                totalRecauder: '0',
                                totalOrderPayment: '0',
                                isViewDetailsPorducts: 'true',
                                isSelectInvocies: "true",
                                notDetails: "true"
                            }
                        });
                        break;

                    case TypeInvoiceEnum.ANTICIPO:
                        console.log("Llego aca al ANTICIPO");
                        break;

                    case TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO:
                        console.log("Llego aca al PAGOS_APLICATIVO_MEICO");
                        break;


                }



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
            if (conceptDeliverySelect?.length != guide?.facturas?.length) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar los estados de entrega por factura.");
                setModalVisible(true);
                return;
            }

            if (disabledInvoices?.size != guide?.facturas?.length) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debes enviar los códigos OTP de todas las facturas.");
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
        ?.filter(pago => pago.estado === "APPROVED" || pago.contingencia === true)
        .reduce((sum, pago) => sum + (Number(pago?.valorPagado) || 0), 0) || 0;

    // Calcular la suma de todos los valorTotal y dfr de todas las facturas
    const totalFacturas = guide?.facturas?.reduce((sum, factura) => {
        const valorTotal = Number(factura?.valorRecaudar || 0);
        const dfr = Number(factura?.dfr || 0);
        return sum + valorTotal;
    }, 0) || 0;

    const totalvalorRecaudar =
        guide?.facturas
            ?.reduce((sum, f) => sum + (Number(f?.valorRecaudar) || 0), 0) || 0;


    const totalRecauder = Math.max(0, totalvalorRecaudar - totalAproved);
    const conditionButton = conceptDeliverySelect.length == guide?.facturas?.length;
    const validateCheckboxlength = conceptDeliverySelect.length == guide?.facturas?.length;
    const isSmallScreen = height <= 780;
    const conceptDeliveryValue = conceptDeliverySelect.length > 0;
    const conditionEntryVisible = !conditionButton && conceptDeliveryValue || EntryVisible;
    // const conditionEntryVisibleTwo = !conditionButton && conceptDeliveryValue;
    const areAllInvoicesConutreDlivery = guide?.facturas.every(
        factura => factura.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO || factura.tipo === TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO
    );
    const conditionEntryVisibleTwo = conditionEntryVisible || guide?.fecha_apertura || EntryVisible || conditionButton;

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

            {!guide ? (
                <OrderDetailSkeletonSelect />

            ) : (
                <>
                    <ScrollView
                        style={[styles.scrollView, { marginTop: RefreshingOnPress ? 90 : 8 }]}
                        contentContainerStyle={[
                            styles.scrollContent,
                            // Ajustar el padding cuando no hay alerta
                        ]}
                        showsVerticalScrollIndicator={false}
                    >

                        {/* Card blanco centrado */}
                        <View
                            style={[
                                styles.card,
                                areAllInvoicesConutreDlivery ? { minHeight: 240 } : null
                            ]}
                        >

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
                                {areAllInvoicesConutreDlivery && (
                                    <>
                                        <View style={styles.row}>
                                            <Text style={styles.labelTotal}>Valor total del pedido</Text>
                                            <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                                                {
                                                    '$ ' +
                                                    totalvalorRecaudar.toLocaleString('es-CO', { minimumFractionDigits: 0 })
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
                                    </>

                                )}

                            </View>
                        </View>

                        <View style={styles.headerContainerTwo}>
                            <Text style={styles.headerTitleTWO}>Ordenes a entregar</Text>
                        </View>
                        {guide && (
                            <View style={{ flex: 1, padding: 16 }}>
                                <InvoicesList
                                    guide={guide}
                                    onInvoiceSelect={handleInvoiceSelect}
                                    documentMeico={documentMeico}
                                    numberGuide={numberGuide}
                                    isSelectInvocies={isSelectInvocies}
                                    token={token}
                                    conceptDelivery={conceptDelivery}
                                    activeView={activeView}
                                    conceptDeliverySelect={conceptDeliverySelect}
                                    disabledInvoices={disabledInvoices}
                                />
                            </View>
                        )}

                    </ScrollView>
                    {guide?.estado === 'Pendiente' && (
                        <View style={[styles.redBackground, { height: heightValue ? 100 : 90 }]} />
                    )}

                    <View style={[styles.footer, {
                        marginBottom: isSmallScreen ? 0 : heightValue ? 0 : 20,
                        bottom: isSmallScreen ? 12 : heightValue ? 60 : 30
                    }]}>

                        {guide?.estado === 'Pendiente' && (
                            <PrimaryButtonDetails
                                ref={btnRef}
                                autoReset={validateException}
                                key={conditionEntryVisibleTwo ? "cerrar" : "llegue"}
                                title={conditionEntryVisibleTwo ? "Cerrar pedido" : "Ya llegué"}
                                onPress={conditionEntryVisibleTwo ? submitData : handleSubmit}
                                disabled={false}
                                width={328}
                                height={43}
                                buttonColor={conditionEntryVisible ? "#DDDFE8" : undefined}
                                buttonColorEnd={conditionEntryVisible ? "#DDDFE8" : undefined}
                                titleColor={conditionEntryVisible ? "#FFFFFF" : undefined}
                                circleColor={conditionEntryVisible ? "#788095" : undefined}
                            />
                        )}
                    </View>
                </>
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

