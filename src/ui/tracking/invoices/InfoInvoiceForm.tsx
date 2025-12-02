import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { UploadPhoto } from '@/components/photo/UploadPhoto';
import { ThemedView } from '@/components/themed-view';
import { StatusDelivery, TypeDelivery, TypeQr } from '@/src/constants/GuideStates';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { OptionsRefused } from '@/src/features/tracking/components/checkbox/OptionsRefused';
import { ChangePhoneModal } from '@/src/features/tracking/components/screens/ChangePhoneModal';
import { DetailsInvoiceQR } from '@/src/features/tracking/components/screens/DetailsInvoiceQR';
import { InfoPayments } from '@/src/features/tracking/components/screens/InfoPayments';
import { ViewQrModal } from '@/src/features/tracking/components/screens/ViewQrModal';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { CreateEntregaProps, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { cleanSpaces } from '@/src/utils/uitls';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface InfoInvoiceFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number
}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type DeliveryStatus = "total" | "parcial" | "rechazo" | null;

export function InfoInvoiceForm({ initialGuide, token = "", onSubmit, numberGuide }: InfoInvoiceFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [showChangePhone, setShowChangePhone] = useState(false);
    const [modalgenerateQR, setModalgenerateQR] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSuccessQRp, setShowSuccessQRP] = useState(false);
    const [showErrorQRP, setShowErrorQRP] = useState(false);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
    const [showStatusDelivery, setShowStatusDelivery] = useState<DeliveryStatus>(null); const [showPaymentPending, setShowPaymentPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [EntryVisible, setEntryVisible] = useState(false);
    const [modalRefused, setShowModalRefused] = useState(false);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState<Invoice | undefined>();
    const [qrBase64, setQrBase64] = useState<string>('');
    const [qrType, setQrType] = useState<string>('');
    const [phone, setPhone] = useState("");
    const [validateIsBotton, setvalidateIsBotton] = useState(false);
    const btnRef = useRef<any>(null);
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };

    useEffect(() => {
        if (modalRefused) {
            setShowDetailInvoiceQR(false);
            setModalgenerateQR(false);
        }
    }, [modalRefused]);

    useEffect(() => {

        const fetchGuide = async () => {
            try {
                const respones = await invoiceRepositoryImpl.successfulBillPayment(
                    Number(numberGuide),
                    token
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
    }, [Number(numberGuide), token]);

    const handleGenerateQR = (type: string, qr?: string) => {
        setModalgenerateQR(true);
        setShowDetailInvoiceQR(false);
        setShowPayment(false);
        if (qr) setQrBase64(qr);
        if (type) setQrType(type);
    };

    const handlSendWhatsApp = async () => {
        try {
            if (qrType == TypeQr.PASARELA) {
                setShowSuccessQRP(true);
                setModalgenerateQR(false);
                setTimeout(() => {
                    setShowPaymentPending(true);
                }, 3000);
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        try {
            setvalidateIsBotton(true);
            setEntryVisible(true);
            setRouteStarted(true);
            // setLoading(true);
            // const location = await Location.getCurrentPositionAsync({
            //     accuracy: Location.Accuracy.Highest,
            // });
            // const response = await invoiceRepositoryImpl.openAddresses(
            //     {
            //         latitud: String(location.coords.latitude),
            //         longitud: String(location.coords.longitude),
            //         fechaHoraDispositivo: getDeviceDateTime()
            //     },
            //     guide?.idDireccion || 0,
            //     token
            // );
            // if (response?.statusCode === 200) {
            //     setvalidateIsBotton(true);
            //     setEntryVisible(true);
            //     setRouteStarted(true);
            // } else {
            //     setValidateException(true);
            //     btnRef.current?.reset();
            //     setModalTitle("¡Alerta!");
            //     setModalMessage(response?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
            //     setModalVisible(true);
            // }
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

    const validateButton = async () => {
        try {
            setShowDetailInvoiceQR(false);
            setShowPayment(false);
            if (!routeStarted) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe indicar que ya llegó al lugar de la dirección para poder ejecutar esta acción.");
                setModalVisible(true);
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            setTimeout(async () => {
                //  Ejecutar la petición cuando termine el timeout
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

                    }
                }


                const responeData = await invoiceRepositoryImpl.successfulBillPayment(
                    Number(numberGuide),
                    token
                );
                if (responeData?.statusCode === 200) {
                    const invoice = responeData.data as Invoice;
                    setPaymentSuccessful({
                        numeroFactura: invoice.numeroFactura,
                        nombreEstablecimiento: invoice.nombreEstablecimiento,
                        totalFactura: invoice.totalFactura,
                        saldoPendiente: invoice.saldoPendiente,
                        numeroContacto: invoice.numeroContacto,
                        pagos: invoice.pagos?.map(pago => ({
                            id: pago.id,
                            numeroDeposito: pago.numeroDeposito,
                            fechaDeposito: pago.fechaDeposito,
                            valorPagado: pago.valorPagado,
                            canal: pago.canal,
                            numeroDocumento: pago.numeroDocumento,
                            estado: pago.estado,
                            referencia: pago.referencia
                        }))
                    });

                }
                setRefreshing(false);
            }, 2000);
        } catch (error) {
            setRefreshing(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const uploadPhotoSubmit = async () => {
        try {

            if (showStatusDelivery) {
                setLoading(true);

                const facturasArray: CreateEntregaProps[] = [];
                let responses: any[] = [];

                if (guide?.facturas && guide.facturas.length > 0) {
                    guide.facturas.forEach((factura, index) => {
                        facturasArray.push({
                            ruta: String(numberGuide),
                            documentMeico: String(factura.numeroFactura),
                            direccion: Number(guide?.idDireccion),
                            causal: "CS_ART_MAL_EST",
                            estado: "EST_PEDI_PEND",
                            files: multiplePhotos.map((item, photoIndex) => ({
                                tipoEntrega:
                                    showStatusDelivery === StatusDelivery.TOTAL
                                        ? TypeDelivery.ENT_TOTAL
                                        : showStatusDelivery === StatusDelivery.PARCIAL
                                            ? TypeDelivery.ENT_PARCIAL
                                            : TypeDelivery.RECHAZADO,

                                rutaArchivo: item.base64 ?? "",
                                // nombreArchivo: `factura_${factura.numeroFactura}_evidencia_${photoIndex + 1}.jpg`,
                            }))
                        });
                    });
                }

                if (facturasArray.length > 0) {
                    responses = await Promise.all(
                        facturasArray.map(facturaData =>
                            invoiceRepositoryImpl.createDelivery(facturaData, token)
                        )
                    );

                    // Verificar si todas las respuestas fueron exitosas
                    const success = responses.every((resp: any) =>
                        resp?.statusCode === 200 || resp?.success === true
                    );

                    if (success) {
                        setLoading(false);
                        setModalTitle("¡Procesado!");
                        setModalMessage(`${facturasArray.length} soporte(s) procesados exitosamente.`);
                        setModalVisible(true);
                    } else {
                        setLoading(false);
                        // Opcional: mostrar detalles del primer error
                        const oneError = responses.find((resp: any) =>
                            !(resp?.statusCode === 200 || resp?.success === true)
                        );
                        setModalTitle("Alerta");
                        setModalMessage(oneError?.message || "Error inesperado.");
                        setModalVisible(true);
                    }
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
        const processPhotos = async () => {
            if (multiplePhotos.length > 0) {
                await uploadPhotoSubmit();
            }
        };

        processPhotos();
    }, [multiplePhotos]);

    const paymentsData = [
        {
            "id": 49,
            "numeroDeposito": "9325897-20250926085604155",
            "fechaDeposito": "2025-09-26T08:56:04.290514",
            "valorPagado": "29698.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-176"
        },
        {
            "id": 51,
            "numeroDeposito": "9325897-20250926091526082",
            "fechaDeposito": "2025-09-26T09:15:26.264034",
            "valorPagado": "29698.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-173"
        },
        {
            "id": 55,
            "numeroDeposito": "9325897-20250926121943717",
            "fechaDeposito": "2025-09-26T12:19:43.770399",
            "valorPagado": "29698.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-174"
        },
        {
            "id": 56,
            "numeroDeposito": "9325897-20250926122340111",
            "fechaDeposito": "2025-09-26T12:23:40.182314",
            "valorPagado": "29698.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-175"
        },
        {
            "id": 62,
            "numeroDeposito": "9325897-20250929163439544",
            "fechaDeposito": "2025-09-29T16:34:49.569403",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 63,
            "numeroDeposito": "9325897-20250929165334148",
            "fechaDeposito": "2025-09-29T16:53:41.911949",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 64,
            "numeroDeposito": "9325897-20250930092323930",
            "fechaDeposito": "2025-09-30T09:23:24.008394",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 65,
            "numeroDeposito": "9325897-20250930092509674",
            "fechaDeposito": "2025-09-30T09:25:09.741043",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 66,
            "numeroDeposito": "9325897-20250930092751826",
            "fechaDeposito": "2025-09-30T09:27:51.902863",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 67,
            "numeroDeposito": "9325897-20250930093255582",
            "fechaDeposito": "2025-09-30T09:32:55.657085",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 68,
            "numeroDeposito": "9325897-20250930093459756",
            "fechaDeposito": "2025-09-30T09:34:59.822916",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
        {
            "id": 69,
            "numeroDeposito": "9325897-20250930093711675",
            "fechaDeposito": "2025-09-30T09:37:11.885568",
            "valorPagado": "1.00",
            "canal": "Pasarela virtual",
            "numeroDocumento": "9325897",
            "estado": "APPROVED",
            "referencia": "9325897-14-192"
        },
    ];
    const newValue = Number(guide?.facturas[0]?.valorTotal) - Number(guide?.facturas[0]?.valorTotal)

    return (
        <ThemedView style={styles.container}>
            <NetworkStatus />

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
                ]} refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={onRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
            >

                {/* Card blanco centrado */}
                <View style={styles.card}>
                    {/* Encabezado */}
                    <View style={styles.cardHeader}>
                        <View
                            style={[
                                styles.statusContainer,
                                guide?.estado !== 'Pendiente' && { backgroundColor: '#DFF5E1' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.status,
                                    guide?.estado !== 'Pendiente' && { color: '#1F9144' },
                                ]}
                            >
                                {guide?.estado ?? 'Pendiente'}
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
                            <Text style={styles.label}>Método de pago</Text>
                            <Text style={styles.value}>Contra-Entrega</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>N° de factura</Text>
                            <Text style={styles.value}>{guide?.facturas[0]?.numeroFactura ?? '0'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Subtotal</Text>
                            <Text style={styles.value}>{'$ ' + (Number(guide?.facturas[0]?.valorTotal) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Descuento financiero</Text>
                            <Text style={[styles.value, { color: '#1F9144' }]}>
                                {'$ - ' + Number(guide?.facturas[0]?.dfr).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.labelTotal}>Total</Text>
                            <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                                {'$ ' + Number(guide?.facturas[0]?.valorTotal).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </Text>
                        </View>

                        <View style={styles.dividerTwo} />

                        {/* Información del pedido */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Valor recaudado</Text>
                            <Text style={styles.value}>{'$ ' + Number(guide?.facturas[0]?.valorTotal).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.labelTotal}>Valor a recaudar</Text>
                            <Text style={[
                                styles.value,
                                {
                                    color: Number(newValue) === 0 ? '#1F9144' : '#C62828',
                                    fontWeight: '800',
                                    fontSize: 16
                                }
                            ]}>
                                {'$ ' + (Number(newValue) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </Text>
                        </View>
                        {/* {newValue != 0 && ( */}
                        <TouchableOpacity style={styles.qrButton} onPress={() => { validateButton(), setShowDetailInvoiceQR(true) }}>
                            <View style={styles.qrButtonContent}>
                                <Image
                                    source={require('@/assets/icons/GenerateQR.png')}
                                    style={styles.qrButtonIcon}
                                />
                                <Text style={styles.qrButtonText}>Generar QR de pago</Text>
                            </View>
                        </TouchableOpacity>
                        {/* )}  */}

                        <TouchableOpacity style={styles.qrButtonDetail} onPress={() => { setShowPayment(true) }}>
                            <Text style={styles.qrButtonText}>Detalle de pagos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.headerContainerTwo}>
                    <Text style={styles.headerTitleTWO}>Estado de entrega</Text>
                </View>

                <View>
                    <DeliveryStatus
                        onStatusChange={(status) => {
                            setShowStatusDelivery(status);
                            // Resetear completado si cambia el estado
                            if (status !== showStatusDelivery) {
                                setIsDeliveryCompleted(false);
                                setMultiplePhotos([]);
                            }
                        }}
                        EntryVisible={EntryVisible}
                        onOpenRefusedModal={() => setShowModalRefused(true)}
                        onUploadPhoto={() => {
                            setUploadPhoto(true);
                        }}
                        isCompleted={isDeliveryCompleted}
                        selectedStatus={showStatusDelivery}
                    />
                </View>
            </ScrollView>
            <View style={styles.redBackground} />

            <View style={[styles.footer, { marginBottom: 10 }]}>
                <PrimaryButtonDetails
                    ref={btnRef}
                    autoReset={validateException}
                    key={routeStarted ? "cerrar" : "llegue"}
                    title={routeStarted ? "Cerrar pedido" : "Ya llegué"}
                    onPress={routeStarted ? submitData : handleSubmit}
                    disabled={validateIsBotton}
                    width={328}
                    height={43}
                    buttonColor={validateIsBotton ? "#DDDFE8" : undefined}
                    buttonColorEnd={validateIsBotton ? "#DDDFE8" : undefined}
                    titleColor={routeStarted ? "#FFFFFF" : undefined}
                    circleColor={validateIsBotton ? "#788095" : undefined}
                />
            </View>

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />

            {(showPayment) && (
                <InfoPayments
                    title="Detalle de pagos"
                    subTitle="La factura no tiene pagos registrados"
                    description="Los pagos asociados a esta factura aparecerán aquí"
                    onClose={() => setShowPayment(false)}
                    width={width}
                    payments={paymentSuccessful?.pagos ? paymentSuccessful?.pagos : paymentsData}
                />
            )}

            {(showDetailInvoiceQR && routeStarted) && (
                <DetailsInvoiceQR
                    data={guide}
                    onClose={() => setShowDetailInvoiceQR(false)}
                    onChangePhone={() => {
                        setShowDetailInvoiceQR(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    onGenerateQR={handleGenerateQR}
                    onPressPayment={() => setRefreshingOnPress(true)}
                    onErrorPayment={() => setShowErrorQRP(true)}
                />
            )}

            {modalgenerateQR && (
                <ViewQrModal
                    data={guide}
                    onClose={() => {
                        setModalgenerateQR(false);
                    }}
                    onChangePhone={() => {
                        setShowDetailInvoiceQR(false);
                        setShowPayment(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    qrData={qrBase64}
                    qrType={qrType}
                    onChangeQRType={() => {
                        setShowDetailInvoiceQR(true);
                        setModalgenerateQR(false);
                    }}
                    onSendWhatsApp={handlSendWhatsApp}
                />
            )}

            {(uploadPhoto) && (
                <UploadPhoto
                    title="Cargar evidencia"
                    subTitle="Toma fotos de la mercancía ubicada en el cliente. Podrás asociar un máximo de 3 imágenes por entrega."
                    onClose={() => setUploadPhoto(false)}
                    width={width}

                    onEvidenceComplete={(evidences) => {
                        setIsDeliveryCompleted(true);
                        setUploadPhoto(false); // Cerrar después de completar
                        setMultiplePhotos(evidences);

                    }}
                    onPermisionsPhoto={() => {
                        setUploadPhoto(false);
                        setModalTitle("Permiso denegado ¡Alerta!");
                        setModalMessage("No podemos acceder a la cámara. Activa el permiso en la configuración del dispositivo para continuar.");
                        setModalVisible(true);
                    }}
                    onPermisionsGallery={() => {
                        setUploadPhoto(false);
                        setModalTitle("Permiso denegado ¡Alerta!");
                        setModalMessage("No podemos acceder a la galería. Activa el permiso en la configuración del dispositivo para continuar.");
                        setModalVisible(true);
                    }}
                />
            )}

            <ChangePhoneModal
                visible={showChangePhone}
                onClose={() => setShowChangePhone(false)}
                onConfirm={(newPhone) => {
                    setPhone(newPhone);
                    setShowChangePhone(false);
                    setShowDetailInvoiceQR(true);
                }}
                onAlert={() => {
                    setTimeout(() => {
                        setShowSuccess(true);
                    }, 100);
                }}
            />

            {showSuccess && (
                <TopSuccessAlert
                    visible={showSuccess}
                    message="Número de teléfono actualizado"
                    onHide={() => setShowSuccess(false)}
                />
            )}

            {showSuccessQRp && (
                <TopSuccessAlert
                    visible={showSuccessQRp}
                    message="Envió exitoso"
                    subtitle="Enviamos el QR de pago al número 2612152672"
                    onHide={() => setShowSuccessQRP(false)}
                />
            )}

            {showErrorQRP && (
                <TopErrorAlert
                    visible={showErrorQRP}
                    message="No pudimos generar el QR"
                    subtitle="Ocurrió un error al generar el QR, inténtalo nuevamente"
                    onHide={() => setShowErrorQRP(false)}
                />
            )}

            {modalRefused && (
                <OptionsRefused
                    onClose={() => { setShowModalRefused(false) }}
                    width={width}
                    onPress={(selectedStatus) => {
                        setvalidateIsBotton(false);
                        if (selectedStatus === 'Tienda') {
                            setShowModalRefused(false);
                            setUploadPhoto(true);
                        }
                    }}
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
        minHeight: 368,
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

