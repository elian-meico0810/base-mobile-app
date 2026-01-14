import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { UploadPhoto } from '@/components/photo/UploadPhoto';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import { CausalDelivery, OptionsRefusedEnum, StatusDelivery, TypeConPagoEnum, TypeDelivery, TypeInvoiceEnum, TypeQr } from '@/src/constants/GuideStates';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { OptionsRefused } from '@/src/features/tracking/components/checkbox/OptionsRefused';
import { ChangePhoneModal } from '@/src/features/tracking/components/screens/ChangePhoneModal';
import { DetailsInvoiceQR } from '@/src/features/tracking/components/screens/DetailsInvoiceQR';
import { InfoPayments } from '@/src/features/tracking/components/screens/InfoPayments';
import { ViewQrModal } from '@/src/features/tracking/components/screens/ViewQrModal';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { CreateEntregaProps, DerliveryDocument, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { capitalizeFirst, cleanSpaces, getDeviceDateTime, getDistanceInMeters } from '@/src/utils/uitls';
import { Image } from 'expo-image';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface InfoInvoiceAnticipateAndCountFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isEmbedded?: boolean;

}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type DeliveryStatus = "total" | "parcial" | "rechazo" | null;
type OptionsRefusedPorps = 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null;

export function InfoInvoiceAnticipateAndCountForm({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, isEmbedded = false }: InfoInvoiceAnticipateAndCountFormProps) {
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
    const [typeQRSendWhatsApp, setTypeQRSendWhatsApp] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSuccessQRp, setShowSuccessQRP] = useState(false);
    const [showErrorQRP, setShowErrorQRP] = useState(false);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
    const [showStatusDelivery, setShowStatusDelivery] = useState<"total" | "parcial" | "rechazo" | null>(null);
    const [isInicilizationApi, setInicilizationApi] = useState(false);
    const [showOptionRefused, setShowOptionRefused] = useState<OptionsRefusedPorps>(null);
    const [showPaymentPending, setShowPaymentPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [EntryVisible, setEntryVisible] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState(false);
    const [modalRefused, setShowModalRefused] = useState(false);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [conceptDelivery, setConceptDelivery] = useState<DerliveryDocument | null>(null);
    const [validateException, setValidateException] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState<Invoice | undefined>();
    const [qrBase64, setQrBase64] = useState<string>('');
    const [qrType, setQrType] = useState<string>('');
    const [phone, setPhone] = useState("");
    const [validateIsBotton, setvalidateIsBotton] = useState(false);
    const [checkUbication, setCheckUbication] = useState(false);
    const btnRef = useRef<any>(null);
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };

    useEffect(() => {
        setPhone(phone);
    }, [phone]);

    useEffect(() => {
        if (modalRefused) {
            setShowDetailInvoiceQR(false);
            setModalgenerateQR(false);
        }
    }, [modalRefused]);

    useEffect(() => {
        if (isSelectInvocies) {
            setRouteStarted(true);
        }
    }, [isSelectInvocies]);

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

    const handleGenerateQR = (type: string, qr?: string) => {
        setModalgenerateQR(true);
        setShowDetailInvoiceQR(false);
        setShowPayment(false);
        if (qr) setQrBase64(qr);
        if (type) setQrType(type);
    };

    const condPago = guide?.facturas[0]?.condPago == TypeConPagoEnum.TAT;

    const handlSendWhatsApp = async () => {
        try {
            setLoading(true);
            let response;

            if (qrType === TypeQr.PASARELA) {
                response = await invoiceRepositoryImpl.whatsappProps(
                    {
                        whatsapp: String(phone),
                        nombre_cliente: String(guide?.nombreCliente),
                        link_pago: String(qrBase64),
                    },
                    ENV_DEV.KEY_APP
                );
            } else {
                response = await invoiceRepositoryImpl.WhatsappTATImage(
                    {
                        cus_no: String(guide?.codigoCliente),
                        numdoc: String(guide?.facturas?.[0]?.numeroFactura),
                        tipodoc: "TD_FACTURA",
                        tipoCliente: String(guide?.facturas?.[0]?.tipoCliente),
                        cliente: String(guide?.nombreCliente),
                        numeroWhatsapp: "57" + String(phone),
                    },
                    token
                );
            }

            if (response?.statusCode === 200) {
                setShowSuccessQRP(true);
                setModalgenerateQR(false);

                setTimeout(() => {
                    setShowPaymentPending(true);
                }, 3000);
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
                setModalVisible(true);
            }

            setLoading(false);
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }

    const checkUnicationPermissions = async () => {
        try {
            // 2. Obtener ubicación
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            if (!location?.coords) {
                setModalTitle('Permiso denegado ¡Alerta!');
                setModalMessage('Debe activar el permiso de ubicación del dispositivo');
                setModalButtonLabel("Cerrar");
                setModalVisible(true);
                return;
            } else {
                setCheckUbication(true);
            }
        } catch (error: any) {
            setModalTitle("Permiso denegado ¡Alerta!");
            setModalMessage("Debe activar la ubicación del dispositivo");
            setModalButtonLabel("Cerrar");
            setModalVisible(true);
        }
    };

    useEffect(() => {
        if (checkUbication) return; 

        const interval = setInterval(() => {
            checkUnicationPermissions();
        }, 10); 

        return () => clearInterval(interval); 
    }, [checkUbication]);

    
    const handleSubmitData = async () => {
        try {

            if (!deliveryStatus) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar un estado de entrega.");
                setModalVisible(true);
                return;
            }

            setLoading(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            const response = await invoiceRepositoryImpl.OpneAddressesDelivery(
                {
                    latitud: String(location.coords.latitude),
                    longitud: String(location.coords.longitude),
                    fechaHoraDispositivo: getDeviceDateTime(),
                    es_entregado: true
                },
                guide?.idDireccion || 0,
                token
            );
            if (response?.statusCode === 200) {
                setRouteStarted(true);
                if (isSelectInvocies) {
                    router.push(
                        `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${'true'}&documentMeico=${guide?.facturas?.[0]?.numeroFactura}&routeStarted=${'true'}`
                    );
                }
                setvalidateIsBotton(true);
                setEntryVisible(true);

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

    const handleSubmit = async () => {
        try {
            setvalidateIsBotton(true);
            setEntryVisible(true);
            setLoading(true);
            setShowDetailInvoiceQR(false);
            setShowPayment(false);
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
                listDocumentQuery();
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
            if (validateIsBotton) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar un estado de entrega.");
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

    const validateButton = async () => {
        try {
            setShowDetailInvoiceQR(false);
            setShowPayment(false);
            if (!routeStarted && !isSelectInvocies) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe indicar que ya llegó al lugar de la dirección para poder ejecutar esta acción.");
                setModalVisible(true);
                return;
            }

            if (condPago) {
                setTypeQRSendWhatsApp(true);
                setModalgenerateQR(true);
                setShowDetailInvoiceQR(true);
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
                    Number(initialGuide?.facturas[0]?.numeroFactura),
                    ENV_DEV.KEY_APP
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
            if (showStatusDelivery && isInicilizationApi || showOptionRefused != OptionsRefusedEnum.TIENDA && showOptionRefused) {
                setLoading(true);
                setDeliveryStatus(true);
                const facturasArray: CreateEntregaProps[] = [];
                let responses: any[] = [];
                setInicilizationApi(false);
                if (guide?.facturas && guide.facturas.length > 0) {
                    guide.facturas.forEach((factura, index) => {
                        facturasArray.push({
                            ruta: String(numberGuide),
                            documentMeico: String(factura.numeroFactura),
                            direccion: Number(guide?.idDireccion),
                            causal: showOptionRefused === OptionsRefusedEnum.DINERO
                                ? CausalDelivery.DINERO_INSUFICIENTE
                                : showOptionRefused === OptionsRefusedEnum.DUEÑO
                                    ? CausalDelivery.DUENO_NO_CONTESTA
                                    : showOptionRefused === OptionsRefusedEnum.TIENDA
                                        ? CausalDelivery.TIENDA_CERRADA
                                        : showOptionRefused === OptionsRefusedEnum.PRODUCTOS
                                            ? CausalDelivery.PRODUCTOS_DANADOS
                                            : null,
                            estado: "ACT_EST_ENTREGA",
                            files:
                                showStatusDelivery === StatusDelivery.RECHAZADO
                                    ?
                                    showOptionRefused === OptionsRefusedEnum.TIENDA
                                        ? multiplePhotos.map((item) => ({
                                            tipoEntrega: TypeDelivery.RECHAZADO,
                                            rutaArchivo: item.base64 ?? null,
                                        }))
                                        : []
                                    :
                                    multiplePhotos.map((item) => ({
                                        tipoEntrega:
                                            showStatusDelivery === StatusDelivery.TOTAL
                                                ? TypeDelivery.ENT_TOTAL
                                                : showStatusDelivery === StatusDelivery.PARCIAL
                                                    ? TypeDelivery.ENT_PARCIAL
                                                    : TypeDelivery.RECHAZADO,
                                        rutaArchivo: item.base64 ?? null,
                                    })),

                        });
                    });
                    setShowOptionRefused(null);
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
                        listDocumentQuery();
                        setLoading(false);
                        setModalTitle("¡Procesado!");
                        setModalMessage(`Soporte(s) procesados exitosamente.`);
                        setModalVisible(true);
                        setvalidateIsBotton(false);
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
            if (showStatusDelivery && isInicilizationApi || showOptionRefused) {
                await uploadPhotoSubmit();
            }
        };

        processPhotos();
    }, [showStatusDelivery, isInicilizationApi, showOptionRefused]);

    const listDocumentQuery = async () => {
        try {
            setLoading(true);

            const responseQuery = await invoiceRepositoryImpl.listDocument(
                String(guide?.facturas[0]?.numeroFactura),
                Number(guide?.idDireccion),
                token
            );
            let concept: DerliveryDocument | null = null;
            if (responseQuery?.statusCode == 200) {
                if (Array.isArray(responseQuery.data)) {
                    concept = responseQuery.data[0] ?? null;
                } else if (responseQuery.data && typeof responseQuery.data === "object") {
                    concept = responseQuery.data;
                }
                setConceptDelivery(concept);
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
        if (isSelectInvocies) {
            listDocumentQuery();
        }
    }, [isSelectInvocies]);

    const newValue = Number(guide?.facturas[0]?.valorTotal) - Number(guide?.facturas[0]?.valorTotal)

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

    return (
        <ThemedView style={styles.container}>
            {/* <NetworkStatus /> */}

            {/* Fondo gris */}
            <View style={styles.background} />

            {/* Header con título */}
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
                            <Text style={styles.label}>Ordenes a entregar</Text>
                            <Text style={styles.value}>
                                {capitalizeFirst(value)}
                            </Text>
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
                                {'$ ' + Number(guide?.facturas[0]?.valorRecaudar).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
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

                        {newValue != 0 && (
                            <TouchableOpacity
                                style={styles.qrButton}
                                onPress={() => {
                                    validateButton();
                                    setShowDetailInvoiceQR(true);
                                }}
                            >
                                <View style={styles.qrButtonContent}>
                                    <Image
                                        source={require('@/assets/icons/GenerateQR.png')}
                                        style={styles.qrButtonIcon}
                                    />
                                    <Text style={styles.qrButtonText}>Generar QR de pago</Text>
                                </View>
                            </TouchableOpacity>
                        )}

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
                        EntryVisible={isSelectInvocies ? true : EntryVisible}
                        onOpenRefusedModal={() => setShowModalRefused(true)}
                        onUploadPhoto={() => {
                            setUploadPhoto(true);
                        }}
                        isCompleted={isDeliveryCompleted}
                        selectedStatus={showStatusDelivery}
                        typeDerlivery={conceptDelivery?.tipoEntrega?.codigo ?? undefined}
                        conceptDelivery={conceptDelivery}
                    />
                </View>
            </ScrollView>
            {guide?.estado === 'Pendiente' && (
                <View style={styles.redBackground} />
            )}

            <View style={[styles.footer, { marginBottom: 10 }]}>

                {isSelectInvocies ? (
                    <PrimaryButton
                        title="Entregar"
                        onPress={handleSubmitData}
                        disabled={!showStatusDelivery ? true : false}
                        width={328}
                        height={43}
                    />
                ) : (
                    <PrimaryButtonDetails
                        ref={btnRef}
                        autoReset={validateException}
                        key={routeStarted ? "cerrar" : "llegue"}
                        title={routeStarted ? "Cerrar pedido" : "Ya llegué"}
                        onPress={routeStarted ? submitData : handleSubmit}
                        disabled={false}
                        width={328}
                        height={43}
                        buttonColor={validateIsBotton ? "#DDDFE8" : undefined}
                        buttonColorEnd={validateIsBotton ? "#DDDFE8" : undefined}
                        titleColor={routeStarted ? "#FFFFFF" : undefined}
                        circleColor={validateIsBotton ? "#788095" : undefined}
                    />
                )
                }


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
                    payments={paymentSuccessful?.pagos ? paymentSuccessful?.pagos : []}
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
                    statusTypeQR={typeQRSendWhatsApp}
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
                        setUploadPhoto(false);
                        setMultiplePhotos(evidences);
                        setInicilizationApi(true);
                    }}
                    onPermisionsPhoto={() => {
                        setUploadPhoto(false);
                        setModalTitle(" denegado ¡Alerta!");
                        setModalMessage("No podemos acceder a la cámara. Activa el permiso en la configuración del dispositivo para continuar.");
                        setModalVisible(true);
                    }}
                    onPermisionsGallery={() => {
                        setUploadPhoto(false);
                        setModalTitle(" denegado ¡Alerta!");
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
                    subtitle={`Enviamos el QR de pago al número ${phone}`}
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
                        setShowOptionRefused(selectedStatus);
                        if (selectedStatus === 'Tienda') {
                            setShowModalRefused(false);
                            setUploadPhoto(true);
                        } if (selectedStatus != 'Tienda') {
                            setInicilizationApi(true);
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

