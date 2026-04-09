import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { ThemedView } from '@/components/themed-view';
import { CausalDelivery, OptionsRefusedEnum, StatusDelivery, TypeDelivery, TypeInvoiceEnum } from '@/src/constants/GuideStates';
import OneSelectedOrder from '@/src/features/tracking/components/checkbox/OneSelectedOrder';
import { OptionsRefused } from '@/src/features/tracking/components/checkbox/OptionsRefused';
import InvoicesOneList from '@/src/features/tracking/components/tabs/InvoiceIOnetem';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { CreateEntregaProps, DerliveryDocument, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
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

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type OptionsRefusedPorps = 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null;

export function ViewSelectInvoice({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, routeStartedBotton }: ViewSelectInvoiceProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [showPayment, setShowPayment] = useState(false);
    const [openPayment, setOpenDetailPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [conceptDelivery, setConceptDelivery] = useState<DerliveryDocument[]>([]);
    const [showPaymentPending, setShowPaymentPending] = useState(false);
    const [isEquals, setIsEquals] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [EntryVisible, setEntryVisible] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [validateIsBotton, setvalidateIsBotton] = useState(false);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [showCheckboxAll, setShowCheckboxAll] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState<Invoice | undefined>();
    const [selectedMultipleInvoices, setSelectedMultipleInvoices] = useState<GuideDetails[]>([]);
    const [showOptionRefused, setShowOptionRefused] = useState<OptionsRefusedPorps>(null);
    const [modalRefused, setShowModalRefused] = useState(false);
    const [activeView, setActiveView] = useState(false);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [isInicilizationApi, setInicilizationApi] = useState(false);
    const [showStatusDelivery, setShowStatusDelivery] = useState<"total" | "parcial" | "rechazo" | null>(null);
    const [deliveryStatus, setDeliveryStatus] = useState(false);
    const [nextPages, setNextPages] = useState(false);
    const [buttonValue, setButtonValue] = useState(false);
    const [activateSelect, setActivateSelect] = useState(false);
    const prevSelectedCountRef = useRef<number>(0);
    const [allowBack, setAllowBack] = useState(false);
    const [isValidData, setIsValidData] = useState(false);

    const btnRef = useRef<any>(null);
    const [checkUbication, setCheckUbication] = useState(false);
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



    useEffect(() => {
        if (guide?.fecha_apertura && !buttonValue) {
            listDocumentQuery();
            setButtonValue(true);
        }
    }, [token]);

    useEffect(() => {
        const currentCount = selectedMultipleInvoices.length;
        const previousCount = prevSelectedCountRef.current;

        if (previousCount != currentCount) {
            setShowCheckbox(false);
        }
        prevSelectedCountRef.current = currentCount;
    }, [selectedMultipleInvoices]);


    useEffect(() => {
        if (conceptDelivery.length === guide?.facturas.length) {
            setActiveView(false);
            setShowCheckboxes(false);
        }
    }, [conceptDelivery]);

    const handleMultiSelect = (selectedGuides: GuideDetails[]) => {
        try {
            setSelectedMultipleInvoices(selectedGuides);
            if (!routeStarted && !conditionButton && !validateCheckbox && !buttonValue) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe confirmar que ya ha llegado a la dirección.");
                setModalVisible(true);
                return;
            }
        } catch (error) {
            setLoading(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrió un error inesperado.");
            setModalVisible(true);
        }
    };

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
                setActiveView(true);
                setShowCheckboxes(true);
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
                setModalMessage("Debe especificar un estado de entrega1111.");
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

    const handleSubmitData = async () => {

        try {
            const numeroFactura =
                selectedMultipleInvoices?.[0]?.facturas?.[0]?.numeroFactura;

            const exitDocument = conceptDelivery?.some(
                (item: any) => String(item.documentMeico) === String(numeroFactura)
            );

            if (!exitDocument && showCheckbox) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar un estado de entrega.");
                setModalVisible(true);
                return;
            }

            if (selectedMultipleInvoices.length === 0) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe seleccionar una factura a entregar.");
                setModalVisible(true);
            }
            if (selectedMultipleInvoices.length === 1) {
                setShowCheckbox(true);
            } else if (selectedMultipleInvoices.length >= 2) {
                setShowCheckboxAll(true);
                setShowCheckbox(true);

            }

        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = async () => {
        try {
            router.push(
                `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&token=${encodeURIComponent(token ?? "")}&numberGuide=${numberGuide}`
            );
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
        if (token) {
            listDocumentQuery();
        }
    }, [token]);

    const uploadPhotoSubmit = async () => {
        try {

            setLoading(true);

            const hasValidData = selectedMultipleInvoices.length > 0 &&
                selectedMultipleInvoices[0].facturas?.length > 0;

            const hasValidStatusDelivery = showStatusDelivery && isInicilizationApi;
            const hasValidOptionRefused = showOptionRefused &&
                showOptionRefused !== OptionsRefusedEnum.TIENDA;
            if (hasValidData && (hasValidStatusDelivery || hasValidOptionRefused)) {
                const facturasArray: CreateEntregaProps[] = [];
                let responses: any[] = [];
                if (!activateSelect && selectedMultipleInvoices[0]?.facturas && selectedMultipleInvoices[0].facturas.length > 0) {
                    setDeliveryStatus(true);
                    setInicilizationApi(false);
                    selectedMultipleInvoices[0].facturas.forEach((factura, index) => {
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
                } else {
                    if (activateSelect && selectedMultipleInvoices.length > 1) {
                        setDeliveryStatus(true);
                        setInicilizationApi(false);
                        // Tipar explícitamente el array como string[]
                        const documentosArray: string[] = [];

                        selectedMultipleInvoices.forEach((selectedInvoice) => {
                            if (selectedInvoice?.facturas && selectedInvoice.facturas.length > 0) {
                                selectedInvoice.facturas.forEach((factura) => {
                                    documentosArray.push(String(factura.numeroFactura));
                                });
                            }
                        });
                        setSelectedMultipleInvoices([]);
                        const facturaData = {
                            ruta: String(numberGuide),
                            documentosArray: documentosArray,
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
                            files: showStatusDelivery === StatusDelivery.RECHAZADO
                                ? showOptionRefused === OptionsRefusedEnum.TIENDA
                                    ? multiplePhotos.map((item) => ({
                                        tipoEntrega: TypeDelivery.RECHAZADO,
                                        rutaArchivo: item.base64 ?? null,
                                    }))
                                    : []
                                : multiplePhotos.map((item) => ({
                                    tipoEntrega:
                                        showStatusDelivery === StatusDelivery.TOTAL
                                            ? TypeDelivery.ENT_TOTAL
                                            : showStatusDelivery === StatusDelivery.PARCIAL
                                                ? TypeDelivery.ENT_PARCIAL
                                                : TypeDelivery.RECHAZADO,
                                    rutaArchivo: item.base64 ?? null,
                                })),
                        };
                        facturasArray.push(facturaData);
                    }
                }

                if (facturasArray.length > 0) {
                    setShowOptionRefused(null);
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
                        setNextPages(true);
                        listDocumentQuery();
                        setModalTitle("¡Procesado!");
                        setModalMessage(`Soporte(s) procesados exitosamente.`);
                        setModalVisible(true);
                        setvalidateIsBotton(false);
                        setLoading(false);
                    } else {
                        // Opcional: mostrar detalles del primer error
                        const oneError = responses.find((resp: any) =>
                            !(resp?.statusCode === 200 || resp?.success === true)
                        );
                        setLoading(false);
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
    const totalAproved = paymentSuccessful?.pagos
        ?.filter(pago => pago.estado === "APPROVED" || pago.contingencia === true)
        .reduce((sum, pago) => sum + (Number(pago?.valorPagado) || 0), 0) || 0;

    // Calcular la suma de todos los valorTotal y dfr de todas las facturas
    const totalFacturas = guide?.facturas
        ?.filter(factura => factura?.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO)
        .reduce((sum, factura) => {
            const valorTotal = Number(factura?.valorRecaudar || 0);
            const dfr = Number(factura?.dfr || 0);
            return sum + valorTotal;
        }, 0) || 0;

    const totalvalorRecaudar =
        guide?.facturas?.filter(factura => factura?.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO)
            ?.reduce((sum, f) => sum + (Number(f?.valorRecaudar) || 0), 0) || 0;

    const totalRecauder = Math.max(0, totalvalorRecaudar - totalAproved);

    const validateCondition = showCheckbox &&
        selectedMultipleInvoices.length <= 1 &&
        selectedMultipleInvoices[0]?.facturas[0]?.tipo !== TypeInvoiceEnum.CONTADO_EFECTIVO;
    const conditionButton = routeStarted || conceptDelivery.length === guide?.facturas?.length && conceptDelivery.length === guide.facturas.length;
    const validateCheckbox = conceptDelivery.length != (guide?.facturas?.length ?? 0) && conceptDelivery.length != 0;
    const validateCheckboxConturyDelivery = showCheckbox && selectedMultipleInvoices.length <= 1 && selectedMultipleInvoices[0]?.facturas[0]?.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO
    const conditionData = showCheckbox && selectedMultipleInvoices.length > 1;
    const validateCheckboxlength = conceptDelivery.length == guide?.facturas?.length;

    useEffect(() => {
        const processPhotos = async () => {
            if (showStatusDelivery && isInicilizationApi || showOptionRefused) {
                await uploadPhotoSubmit();
            }
        };

        processPhotos();
    }, [showStatusDelivery, isInicilizationApi, showOptionRefused]);

    useEffect(() => {
        if (conditionData) {
            setShowCheckbox(false);

        }
    }, [conditionData]);


    useEffect(() => {
        if (selectedMultipleInvoices.length > 1) {
            setActivateSelect(true);
        } else {
            setActivateSelect(false);

        }
    }, [selectedMultipleInvoices]);


    useEffect(() => {
        if (validateCondition) {
            setOpenDetailPayment(true);
        }
    }, [showCheckbox, selectedMultipleInvoices]);

    useEffect(() => {
        if (validateCheckboxConturyDelivery) {
            // Navegar a la nueva pantalla con los parámetros necesarios
            router.push(
                `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(selectedMultipleInvoices[0]))}&token=${encodeURIComponent(token ?? "")}&numberGuide=${numberGuide}&isCountryDelivery=${true}&routeStarted=${'true'}`
            );
        }
    }, [showCheckbox, selectedMultipleInvoices]);
    const isSmallScreen = height <= 780;
    const closeButton = routeStarted || buttonValue;

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
                                {validateCheckboxlength ? 'Pago realizado' : 'Pendiente'}
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
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.labelTotal}>Valor total del pedido</Text>
                        <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                            {
                                '$ ' +
                                guide?.facturas
                                    ?.filter(factura => factura?.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO)
                                    ?.reduce((sum, f) => sum + (Number(f.valorRecaudar) || 0), 0)
                                    ?.toLocaleString('es-CO', { minimumFractionDigits: 0 }) || '0'
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

                <View style={styles.headerContainerTwo}>
                    <View style={{ width: '100%' }}>
                        <Text style={styles.headerTitleTWO}>Ordenes a entregar</Text>
                        {/* Solo mostrar espacio y alerta cuando se cumpla la condición */}
                        {(validateCheckbox && selectedMultipleInvoices.length <= 1 && !openPayment) && (
                            <View style={styles.alertSpacer}>
                                <PaymentPendingAlert
                                    visible={true}
                                    title="Evidencia pendiente"
                                    subtitle="Para cerrar el pedido, debes cargar la evidencia de todas las ordenes."
                                    onHide={() => setShowPaymentPending(false)}
                                />
                            </View>
                        )}
                    </View>
                </View>

                {(!showCheckbox || activateSelect) && (
                    <View style={{ flex: 1, padding: 16 }}>
                        <InvoicesOneList guide={guide}
                            onInvoicesMultiSelect={handleMultiSelect}
                            documentMeico={documentMeico}
                            numberGuide={numberGuide}
                            isSelectInvocies={isSelectInvocies}
                            token={token}
                            conceptDelivery={conceptDelivery}
                            activeView={validateCheckbox ? true : buttonValue ? true : activeView}
                            showCheckboxes={validateCheckbox ? true : buttonValue ? true : showCheckboxes}
                        />
                    </View>
                )}

                {(showCheckbox && selectedMultipleInvoices.length <= 1 && selectedMultipleInvoices[0]?.facturas[0]?.tipo != TypeInvoiceEnum.CONTADO_EFECTIVO) && (
                    <OneSelectedOrder
                        data={selectedMultipleInvoices[0] ? [selectedMultipleInvoices[0]] : undefined}
                        conceptDelivery={conceptDelivery}
                        onSelectionChange={(isSelected, selectedData) => {
                            if (!isSelected) setShowCheckbox(false);
                        }}
                        uploadPhoto={() => setUploadPhoto(true)}
                        onOpenRefusedModal={() => setShowModalRefused(true)}
                        onStatusChange={(status) => { }}
                        selectedStatus={showStatusDelivery}
                        setShowStatusDelivery={setShowStatusDelivery}
                    />
                )}


            </ScrollView>
            {guide?.estado === 'Pendiente' && (
                <View style={[styles.redBackground, { height: heightValue ? 100 : 90 }]} />
            )}

            <View style={[styles.footer, {
                marginBottom: isSmallScreen ? 0 : heightValue ? 0 : 20,
                bottom: isSmallScreen ? 12 : heightValue ? 60 : 30
            }]}>

                {(() => {
                    if (guide?.estado !== 'Pendiente') return null;
                    if (selectedMultipleInvoices.length > 0 || validateCheckbox) {
                        return (
                            <PrimaryButton
                                title={"Continuar"}
                                onPress={nextPages ? handleNextPage : handleSubmitData}
                                disabled={false}
                                width={328}
                                height={43}
                            />
                        );
                    } else {

                        if (selectedMultipleInvoices.length === 0) {
                            return (
                                <PrimaryButtonDetails
                                    ref={btnRef}
                                    autoReset={validateException}
                                    key={conditionButton || buttonValue ? "cerrar" : "llegue"}
                                    title={conditionButton || buttonValue ? "Cerrar pedido" : "Ya llegué"}
                                    onPress={conditionButton || buttonValue ? submitData : handleSubmit}
                                    disabled={false}
                                    width={328}
                                    height={43}
                                    buttonColor={isValidData ? undefined : closeButton || conditionButton ? "#DDDFE8" : validateCheckboxlength ? undefined : undefined}
                                    buttonColorEnd={isValidData ? undefined : closeButton || conditionButton ? "#DDDFE8" : validateCheckboxlength ? undefined : undefined}
                                    titleColor={isValidData ? undefined : closeButton || conditionButton ? "#FFFFFF" : undefined}
                                    circleColor={isValidData ? undefined : closeButton || conditionButton ? "#788095" : validateCheckboxlength ? undefined : undefined}
                                />
                            );
                        }
                    }

                    return null;
                })()}
            </View>

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />
            {(uploadPhoto) && (
                <UploadPhoto
                    title="Cargar evidencia"
                    subTitle="Toma fotos de la mercancía ubicada en el cliente. Podrás asociar un máximo de 3 imágenes por entrega."
                    onClose={() => setUploadPhoto(false)}
                    width={width}

                    onEvidenceComplete={(evidences) => {
                        setUploadPhoto(false);
                        setMultiplePhotos(evidences);
                        setInicilizationApi(true);
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
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitleTWO: {
        fontSize: 20,
        fontWeight: '700',
    },
    alertSpacer: {
        minHeight: 80,
        width: '100%',
        position: 'relative',
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

