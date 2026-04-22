import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { ExecptionModalValidate } from '@/components/generals/ExecptionModalValidate';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { UploadPhotoOTP } from '@/components/photo/uploadPhotoOTP';
import { OrderDetailSkeleton } from '@/components/skeleton/OrderDetailSkeleton ';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import { OptionsRefusedEnum, StatusDelivery, TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { DeliveryStatusAction } from '@/src/features/tracking/components/checkbox/DeliveryStatusAction';
import { NoDeliveryModal } from '@/src/features/tracking/components/checkbox/NoDeliveryModal';
import { OptionsRefused } from '@/src/features/tracking/components/checkbox/OptionsRefused';
import { Cause, GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { CreateEntregaProps, DerliveryDocument, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { capitalizeFirst, cleanSpaces, getDeviceDateTime, getDistanceInMeters, heightCaldulate, toUpperCase, uriToBase64 } from '@/src/utils/uitls';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface InfoInvoiceCreditFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    isViewDetailsPorducts?: boolean;
    detailsCounterDelivery?: boolean;
    isAnticipe?: string;
    routeStartedBotton?: string;
    selectedOption?: string;
    notDetails?: string;
    notEntry?: string;
}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type DeliveryStatus = "total" | "parcial" | "rechazo" | null;
type OptionsRefusedPorps = 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null;

export function InfoInvoiceCreditForm({
    initialGuide,
    token = "",
    onSubmit,
    numberGuide,
    isSelectInvocies,
    documentMeico,
    isViewDetailsPorducts,
    isCountryDelivery,
    detailsCounterDelivery,
    isAnticipe,
    routeStartedBotton,
    selectedOption,
    notDetails,
    notEntry
}: InfoInvoiceCreditFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
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
    const [buttonValue, setButtonValue] = useState(false);
    const [allowBack, setAllowBack] = useState(false);
    const btnRef = useRef<any>(null);
    const [checkUbication, setCheckUbication] = useState(false);
    const router = useRouter();
    const heightValue = heightCaldulate();
    const [statusDOcument, setStatusDOcument] = useState(false);
    const [buttonValueOTP, setButtonValueOTP] = useState(false);
    const [sasToken, setSasToken] = useState("");
    const [showNoDeliveryModal, setShowNoDeliveryModal] = useState(false);
    const [selectedNoDeliveryCause, setSelectedNoDeliveryCause] = useState<Cause | null>(null);
    const [uploadPhotoNoDelivery, setUploadPhotoNoDelivery] = useState(false);
    const [noDeliveryFiles, setNoDeliveryFiles] = useState<string[]>([]);
    const [confirmNoDelivery, setConfirmNoDelivery] = useState(false);
    const [uploadPhotoTwo, setUploadPhotoTwo] = useState(false);
    const [modalVisibleValidate, setModalVisibleValidate,] = useState(false);
    const [modalTitleValidate, setModalTitleValidate] = useState("");
    const [modalMessageValidate, setModalMessageValidate] = useState("");
    const [modalButtonLabelValidate, setModalButtonLabelValidate] = useState("Entendido");
    const [highlightText, setHighlightText] = useState("");
    const [multiplePhotosTwo, setMultiplePhotosTwo] = useState<EvidencePhoto[]>([]);
    const orderId = initialGuide?.pedidos?.[0]?.id;

    const closeButton = routeStarted;

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

    useEffect(() => {
        const init = async () => {
            const token = await SecureStore.getItemAsync("service_token");
            setSasToken(token || "");

        };
        init();

    }, []);



    const handleGoBack = async () => {
        // router.back();
        if (detailsCounterDelivery) {
            router.push({
                pathname: '/views/IndexDetailsInvoice',
                params: {
                    guide: JSON.stringify(guide),
                    numberGuide: numberGuide,
                    token: token ?? "",
                    isSelectInvocies: isSelectInvocies,
                    isAnticipe: isAnticipe,
                    notDetails: notDetails,
                }
            });
        } else {
            router.push(
                `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${isSelectInvocies}`
            );
        }
    };

    useEffect(() => {
        if (isSelectInvocies) {
            setRouteStarted(true);
        }
    }, [isSelectInvocies]);

    useEffect(() => {
        if (guide?.fecha_apertura && !buttonValue) {
            listDocumentQuery();
            setButtonValue(true);
        }
    }, [token]);


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

            const existOtp = await listInfOTByDirection();
            if (existOtp) {
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
                    router.push({
                        pathname: '/views/IndexDetailsInvoice',
                        params: {
                            guide: JSON.stringify(initialGuide),
                            numberGuide: numberGuide,
                            token: token ?? "",
                            isSelectInvocies: "true",
                            notDetails: "true",
                        }
                    });
                }
                setvalidateIsBotton(true);
                setEntryVisible(true);
                setLoading(false);

            } else {
                setLoading(false);
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setLoading(false);
            setValidateException(true);
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setvalidateIsBotton(true);
            setEntryVisible(true);
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
                listDocumentQuery();
                btnRef.current?.reset();
                router.push({
                    pathname: '/views/IndexDetailsInvoice',
                    params: {
                        guide: JSON.stringify(guide),
                        numberGuide: numberGuide,
                        token: token ?? "",
                        notDetails: 'true',

                    }
                });
                setLoading(false);
            } else {
                setLoading(false);
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setLoading(false);
            setValidateException(true);
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
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
                            facturas: clienteEncontrado.facturas,
                            whatsapp: clienteEncontrado.whatsapp,
                            pedidos: clienteEncontrado.pedidos
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
            setLoading(false);
            setRefreshing(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        }
    };

    const uploadPhotoSubmit = async () => {
        try {

            if (showStatusDelivery && isInicilizationApi || showOptionRefused != OptionsRefusedEnum.TIENDA && showOptionRefused) {
                setDeliveryStatus(true);
                const facturasArray: CreateEntregaProps[] = [];
                let responses: any[] = [];
                setLoading(true);

                await new Promise(resolve => setTimeout(resolve, 50));

                setInicilizationApi(false);
                const validBase64 = multiplePhotos
                    .filter(photo => photo.base64 && photo.base64.trim() !== '')
                    .map(photo => photo.base64!);

                if (validBase64.length === 0) {
                    setModalTitle("Alerta");
                    setModalMessage(`Ninguna foto tiene datos base64 válidos`);
                    setModalVisible(true);
                    setLoading(false);

                    return;
                }

                const payload = {
                    id_pedido: Number(orderId),
                    files: validBase64
                };
                const response = await detailsRepositoryImpl.reportNoveltyFileArray(payload, token);

                if (response?.success) {
                    setLoading(false);
                    listDocumentQuery();
                    setModalTitle("¡Procesado!");
                    setModalMessage(`Soporte(s) procesados exitosamente.`);
                    setModalVisible(true);
                    setvalidateIsBotton(false);
                } else {
                    setLoading(false);

                    setModalTitle("Alerta");
                    setModalMessage("Error inesperado.");
                    setModalVisible(true);
                }
            }
        } catch (error) {
            setLoading(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 9.");
            setModalVisible(true);
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
            const response = await detailsRepositoryImpl.novletyOrderByParams(
                Number(orderId),
                token
            )

            if (response?.data && Array.isArray(response.data) && response.data.length > 0) {

                const evidences: EvidencePhoto[] = await Promise.all(
                    response.data.map(async (item: any) => {

                        const fullUri = item.ruta_novedad + sasToken;

                        const base64 = await uriToBase64(fullUri);

                        return {
                            id: Date.now().toString() + Math.random(),
                            uri: fullUri,
                            base64: base64,
                        };
                    })
                );

                setMultiplePhotosTwo(evidences);
                setStatusDOcument(true);

            }

        } catch (error) {
            setLoading(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 10.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const redirectContinue = async () => {
        try {
            if (conceptDelivery == null) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar un estado de entrega.");
                setModalVisible(true);
                return;
            }
            if (Number(numberGuide)) {
                router.push(
                    `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
                );
            }
        } catch (error) {
            setLoading(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 11.");
            setModalVisible(true);
        }
    };

    useEffect(() => {
        if (buttonValueOTP || isSelectInvocies === 'true') return;

        const executeLogic = async () => {
            setModalVisible(false);
            await listInfOTByDirection();
        };
        executeLogic();

        const interval = setInterval(() => {
            executeLogic();
        }, 5000);

        return () => {
            clearInterval(interval);
        };

    }, [paymentSuccessful, buttonValueOTP]);

    const listInfOTByDirection = async () => {
        try {
            if (buttonValueOTP) return;

            const response = await detailsRepositoryImpl.listInfOTP(String(guide?.idDireccion), String(initialGuide?.facturas[0]?.numeroFactura), token);
            if (
                response.success &&
                response.data &&
                typeof response.data !== "string" &&
                !Array.isArray(response.data)
            ) {
                if (response.data.expira_en && response.data.momento_envio && guide) {
                    setButtonValueOTP(true);
                    router.push({
                        pathname: '/views/IndexDetailsInvoice',
                        params: {
                            guide: JSON.stringify(guide),
                            numberGuide: numberGuide,
                            token: token ?? "",
                            confirmationStatus: 'true',
                            responseOTPInit: JSON.stringify(response.data),
                            totalValue: 0,
                            totalRecauder: 0,
                            totalOrderPayment: 0,
                            expireDate: 'true',
                            isSelectInvocies: isSelectInvocies,
                            isAnticipe: isAnticipe,
                            notDetails: "true"
                        }

                    });
                    return true;
                }
            }
            return false;
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        }
    };


    const submitFile = async (newPhoto: EvidencePhoto[]) => {
        try {
            setLoading(true);
            // Pequeña pausa para que se muestre el loading (opcional)
            await new Promise(resolve => setTimeout(resolve, 100));
            router.push({
                pathname: '/views/IndexDetailsInvoice',
                params: {
                    guide: JSON.stringify(guide),
                    numberGuide: numberGuide,
                    token: token ?? "",
                    isFileView: "true",
                    sasToken: sasToken,
                    multiplePhotos: JSON.stringify(newPhoto),
                    isSelectInvocies: isSelectInvocies,
                    isAnticipe: isAnticipe,
                    isAnticipeInvoice: isAnticipe,
                    notDetails: "true"

                }
            });
            setLoading(false);

        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        }
    };

    const handleSubmitConfirmation = async () => {
        try {

            if (!guide?.whatsapp || guide?.whatsapp == "") {
                btnRef.current?.reset();
                setModalTitleValidate("Evidencia requerida");
                setModalMessageValidate("Para finalizar la entrega del pedido debes");
                setHighlightText("Registrar evidencia.");
                setModalButtonLabelValidate("Registrar evidencia");
                setModalVisibleValidate(true);
                return;
            }
            setButtonValueOTP(true);

            setLoading(true);


            const responseData = await detailsRepositoryImpl.sendOTPNotPayment(
                {
                    idDireccion: Number(guide?.idDireccion),
                    numeroFactura: String(guide?.facturas?.[0]?.numeroFactura),
                    // numeroDestino: "+57" + String(guide?.whatsapp).replace(/\D/g, ''),
                    numeroDestino: "+573112187956",
                    valorOriginal: '0',
                    valorPagado: '0',
                },
                token
            );
            if (responseData?.statusCode === 200) {
                console.log("notDetails: ",notDetails);
                console.log("selectedOption: ",selectedOption);
                
                if (notDetails &&
                    selectedOption != null &&
                    String(selectedOption) !== "null") {
                    const responseQuery = await detailsRepositoryImpl.reEntryDelivery(
                        {
                            id_pedido: Number(orderId),
                            reporgrmacion: String(selectedOption)
                        },
                        token
                    );
                    if (responseQuery?.statusCode != 200) {
                        setLoading(false);
                        setValidateException(true);
                        btnRef.current?.reset();
                        setModalTitle("¡Alerta!");
                        setModalMessage(responseQuery?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                        setModalVisible(true);
                        return;
                    }
                }

                btnRef.current?.reset();
                router.push({
                    pathname: '/views/IndexDetailsInvoice',
                    params: {
                        guide: JSON.stringify(guide),
                        numberGuide: numberGuide,
                        token: token ?? "",
                        confirmationStatus: 'true',
                        responseOTPInit: JSON.stringify(responseData.data),
                        totalValue: '0',
                        totalRecauder: '0',
                        totalOrderPayment: '0',
                        isViewDetailsPorducts: 'true',
                        isSelectInvocies: isSelectInvocies,
                        notDetails: "true"
                    }

                });
                setLoading(false);
            } else {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(responseData?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setLoading(false);
            setValidateException(true);
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (detailsCounterDelivery) {
            listDocumentQuery();
        }
    }, [detailsCounterDelivery]);

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

        case TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO:
            value = 'Aplicativo-meico';
            break;
    }

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
                ]} refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={onRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
            >

                {/* Card blanco centrado */}
                {!guide ? (
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

                        {(!notDetails || notEntry) && (
                            <TouchableOpacity
                                style={styles.qrButtonDetailTwo}
                                onPress={() => {
                                    setShowNoDeliveryModal(true);
                                }}
                            >
                                <View >
                                    <Image
                                        source={require('@/assets/icons/CloseRed.png')}
                                        style={styles.icon}
                                    />
                                </View>

                                <Text style={styles.qrButtonTexRed}>
                                    No pude entregar el pedido
                                </Text>
                            </TouchableOpacity>

                        )}

                        {(detailsCounterDelivery) && (
                            <View>
                                <DeliveryStatusAction
                                    onStatusChange={(status) => {
                                        setShowStatusDelivery(status);
                                        // Resetear completado si cambia el estado
                                        if (status !== showStatusDelivery) {
                                            setIsDeliveryCompleted(false);
                                            setMultiplePhotos([]);
                                        }
                                    }}
                                    EntryVisible={isCountryDelivery ? true : isSelectInvocies ? true : buttonValue ? true : EntryVisible}
                                    onOpenRefusedModal={() => setShowModalRefused(true)}
                                    onUploadPhoto={() => {
                                        setUploadPhoto(true);
                                    }}
                                    isCompleted={isDeliveryCompleted}
                                    selectedStatus={showStatusDelivery}
                                    typeDerlivery={statusDOcument ?? undefined}
                                    conceptDelivery={conceptDelivery}
                                />
                            </View>
                        )}

                    </>
                )}

            </ScrollView>

            {guide?.estado === 'Pendiente' && (
                <View style={[styles.redBackground, { height: heightValue ? 100 : 90 }]} />
            )}

            {guide && (

                <View style={[styles.footer, { marginBottom: 10 }]}>
                    {confirmNoDelivery ? (
                        <PrimaryButton
                            title="Confirmar no entrega"
                            onPress={async () => {
                                try {
                                    const documentos = guide?.facturas?.map(f => String(f.numeroFactura)) ?? [];
                                    const payload: any = {
                                        ruta: String(numberGuide),
                                        direccion: Number(guide?.idDireccion),
                                        causal: String(selectedNoDeliveryCause?.codigo),
                                    };
                                    if (documentos.length > 1) {
                                        payload.documentosArray = documentos;
                                    } else {
                                        payload.documentMeico = documentos[0] ?? null;
                                    }
                                    if (noDeliveryFiles.length > 0) {
                                        payload.files = noDeliveryFiles;
                                    }
                                    setLoading(true);
                                    const response = await invoiceRepositoryImpl.registerNoDelivery(payload, String(token));
                                    if (response?.statusCode === 200) {
                                        setModalTitle("¡Procesado!");
                                        setModalMessage("No entrega registrada exitosamente");
                                        setModalVisible(true);
                                        setLoading(false);
                                        await invoiceRepositoryImpl.closeAddresses(guide?.idDireccion || 0, String(token));
                                        router.push(
                                            `/views/details?guide=${numberGuide}&token=${encodeURIComponent(String(token ?? ""))}`
                                        );
                                    } else {
                                        setModalTitle("Alerta");
                                        setModalMessage(response?.message || "Error inesperado.");
                                        setModalVisible(true);
                                    }
                                } catch (error: any) {
                                    setModalTitle("¡Error!");
                                    setModalMessage(error?.data?.message ?? "Ocurrió un error inesperado.");
                                    setModalVisible(true);
                                } finally {
                                    setConfirmNoDelivery(false);
                                    setSelectedNoDeliveryCause(null);
                                    setNoDeliveryFiles([]);
                                }
                            }}
                            disabled={false}
                            width={328}
                            height={43}
                        />
                    ) : (!isViewDetailsPorducts && isSelectInvocies === 'true') ? (
                        <PrimaryButton
                            title="Entregar"
                            onPress={handleSubmitData}
                            disabled={false}
                            width={328}
                            height={43}
                        />
                    ) : notDetails ? (
                        <PrimaryButtonDetails
                            ref={btnRef}
                            autoReset={validateException}
                            key="Enviar confirmación"
                            title="Enviar confirmación"
                            onPress={handleSubmitConfirmation}
                            disabled={false}
                            width={328}
                            height={43}
                            buttonColor={undefined}
                            buttonColorEnd={undefined}
                            titleColor={undefined}
                            circleColor={undefined}
                        />
                    ) : (
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
                                    key={"llegue"}
                                    title={"Ya llegué"}
                                    onPress={handleSubmit}
                                    disabled={false}
                                    width={328}
                                    height={43}
                                    buttonColor={undefined}
                                    buttonColorEnd={undefined}
                                    titleColor={undefined}
                                    circleColor={undefined}
                                />
                            )}
                        </>
                    )}
                </View>
            )}
            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />

            <ExecptionModalValidate
                visible={modalVisibleValidate}
                onClose={() => {
                    setModalVisibleValidate(false);
                }}
                title={modalTitleValidate}
                message={modalMessageValidate}
                buttonLabel={modalButtonLabelValidate}
                highlightText={highlightText}
                onConfirmation={() => {
                    setUploadPhotoTwo(true);
                }}
            />

            {showNoDeliveryModal && (
                <NoDeliveryModal
                    token={String(token)}
                    onClose={() => setShowNoDeliveryModal(false)}
                    width={width}
                    onContinue={(cause) => {
                        setSelectedNoDeliveryCause(cause);
                        setShowNoDeliveryModal(false);
                        if (cause.requiereEvidencia) {
                            setUploadPhotoNoDelivery(true);
                        } else {
                            setConfirmNoDelivery(true);
                        }
                    }}
                />
            )}


            {(uploadPhoto) && (
                <UploadPhoto
                    title="Cargar evidencia"
                    subTitle="Toma fotos de la mercancía ubicada en el cliente. Podrás asociar un máximo de 3 imágenes por entrega."
                    onClose={() => setUploadPhoto(false)}
                    width={width}

                    onEvidenceComplete={async (evidences) => {
                        setInicilizationApi(true);
                        setIsDeliveryCompleted(true);
                        setUploadPhoto(false);
                        setMultiplePhotos(evidences);

                        if (multiplePhotosTwo) {
                            setLoading(true);
                            setInicilizationApi(true);
                            setShowStatusDelivery(StatusDelivery.RECHAZADO);
                            setShowOptionRefused(OptionsRefusedEnum.TIENDA);
                            await uploadPhotoSubmit();
                        }
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
                    multiplePhotos={multiplePhotosTwo}
                    sasToken={sasToken}
                />
            )}

            {uploadPhotoNoDelivery && (
                <UploadPhoto
                    title="Cargar evidencia"
                    subTitle="Toma o adjunta fotos. Máximo 3."
                    onClose={() => setUploadPhotoNoDelivery(false)}
                    width={width}
                    onEvidenceComplete={(evidences) => {
                        const files = evidences
                            .map(e => e.base64)
                            .filter((b64): b64 is string => typeof b64 === "string");
                        setNoDeliveryFiles(files);
                        setUploadPhotoNoDelivery(false);
                        setConfirmNoDelivery(true);
                    }}
                    onPermisionsPhoto={() => {
                        setUploadPhotoNoDelivery(false);
                        setModalTitle("Permiso denegado ¡Alerta!");
                        setModalMessage("No podemos acceder a la cámara. Activa el permiso en la configuración del dispositivo para continuar.");
                        setModalVisible(true);
                    }}
                    onPermisionsGallery={() => {
                        setUploadPhotoNoDelivery(false);
                        setModalTitle("Permiso denegado ¡Alerta!");
                        setModalMessage("No podemos acceder a la galería. Activa el permiso en la configuración del dispositivo para continuar.");
                        setModalVisible(true);
                    }}

                />
            )}

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

            {(uploadPhotoTwo) && (
                <UploadPhotoOTP
                    onClose={() => setUploadPhotoTwo(false)}
                    onPick={(data) => {
                        const newPhoto: EvidencePhoto = {
                            id: Date.now().toString(),
                            uri: data.uri,
                            base64: data.base64
                        };

                        submitFile([newPhoto]);
                    }}
                    onPermisionsPhoto={() => {
                        setUploadPhotoTwo(false);
                        setModalTitle("Permiso denegado ¡Alerta!");
                        setModalMessage("No podemos acceder a la cámara. Activa el permiso en la configuración del dispositivo para continuar.");
                        setModalVisible(true);
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

