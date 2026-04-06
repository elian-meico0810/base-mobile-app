import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { ExecptionModalValidate } from '@/components/generals/ExecptionModalValidate';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { TypePayment } from '@/components/generals/TypePayment';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { UploadPhotoOTP } from '@/components/photo/uploadPhotoOTP';
import { OrderDetailSkeleton } from '@/components/skeleton/OrderDetailSkeleton ';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import { OptionsRefusedEnum, StatusDelivery, TypeCaculateValueEnum, TypeConPagoEnum, TypeInvoiceEnum, TypeQr } from '@/src/constants/GuideStates';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { DeliveryStatusAction } from '@/src/features/tracking/components/checkbox/DeliveryStatusAction';
import { NoDeliveryModal } from '@/src/features/tracking/components/checkbox/NoDeliveryModal';
import { OptionsRefused } from '@/src/features/tracking/components/checkbox/OptionsRefused';
import { ChangePhoneModal } from '@/src/features/tracking/components/screens/ChangePhoneModal';
import { DetailsInvoiceQR } from '@/src/features/tracking/components/screens/DetailsInvoiceQR';
import { DetailsPaymenTypeEfecty } from '@/src/features/tracking/components/screens/DetailsPaymenTypeEfecty';
import { DetailsPaymenTypeOthers } from '@/src/features/tracking/components/screens/DetailsPaymenTypeOthers';
import { InfoPayments } from '@/src/features/tracking/components/screens/InfoPayments';
import { ViewQrModal } from '@/src/features/tracking/components/screens/ViewQrModal';
import { Cause, Detail, Document, GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { CreateEntregaProps, DerliveryDocument, Invoice, TypeParameterValue } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { calculateValuesDFRArray, calculateVlueByPorducts, capitalizeFirst, cleanSpaces, getDeviceDateTime, getDistanceInMeters, heightCaldulate, toUpperCase, uriToBase64 } from '@/src/utils/uitls';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface InfoInvoiceFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    IsGoBack?: boolean;
    routeStartedBotton?: string;
    detailsCounterDelivery?: boolean;
    isViewDetailsPorducts?: boolean;
}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type DeliveryStatus = "total" | "parcial" | "rechazo" | null;
type OptionsRefusedPorps = 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null;

export function InfoInvoiceForm({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, isCountryDelivery = false, IsGoBack = false, routeStartedBotton, detailsCounterDelivery, isViewDetailsPorducts }: InfoInvoiceFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [guideAny, setGuideAny] = useState<GuideDetails[]>([]);
    const [guideByProduct, setGuideByPorduct] = useState<GuideDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [ejcuteApi, setEjecuteApi] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [showPayment, setShowPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewOrder, setIsOrder] = useState<GuideDetails | null>(null);
    const [typePaymentView, setTypePaymentView] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [modalVisibleValidate, setModalVisibleValidate,] = useState(false);
    const [modalTitleValidate, setModalTitleValidate] = useState("");
    const [modalMessageValidate, setModalMessageValidate] = useState("");
    const [modalButtonLabelValidate, setModalButtonLabelValidate] = useState("Entendido");
    const [highlightText, setHighlightText] = useState("");

    const [showChangePhone, setShowChangePhone] = useState(false);
    const [modalgenerateQR, setModalgenerateQR] = useState(false);
    const [typeQRSendWhatsApp, setTypeQRSendWhatsApp] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSuccessQRp, setShowSuccessQRP] = useState(false);
    const [showErrorQRP, setShowErrorQRP] = useState(false);
    const [showResultData, setResultData] = useState<GuideDetails | null>(null);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [multiplePhotosTwo, setMultiplePhotosTwo] = useState<EvidencePhoto[]>([]);
    const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
    const [showStatusDelivery, setShowStatusDelivery] = useState<"total" | "parcial" | "rechazo" | null>(null);
    const [isInicilizationApi, setInicilizationApi] = useState(false);
    const [showOptionRefused, setShowOptionRefused] = useState<OptionsRefusedPorps>(null);
    const [valueOrderCalculate, setValueOrderCalculate] = useState(0);
    const [newTotalValue, setNewTotalValue] = useState(0);
    const [valueOrderPaymentByType, setValuePaymentByType] = useState(0);
    const [newValue, setNewValue] = useState(0);
    const [showPorductData, setPorductData] = useState<Document[]>([]);
    const [showPaymentPending, setShowPaymentPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [EntryVisible, setEntryVisible] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState(false);
    const [modalRefused, setShowModalRefused] = useState(false);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [typePayment, setTypePayment] = useState(false);
    const [typePaymentTypeEfecty, setTypePaymenTypeEfecty] = useState(false);
    const [typePaymentTypeOthers, setTypePaymenTypeOthers] = useState(false);
    const [statusDOcument, setStatusDOcument] = useState(false);
    const [conceptDelivery, setConceptDelivery] = useState<DerliveryDocument | null>(null);
    const [validateException, setValidateException] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState<Invoice | undefined>();
    const [typeCash, setTypeCash] = useState<TypeParameterValue[]>([]);
    const [qrBase64, setQrBase64] = useState<string>('');
    const [qrType, setQrType] = useState<string>('');
    const [phone, setPhone] = useState("");
    const [buttonValue, setButtonValue] = useState(false);
    const [buttonValueOTP, setButtonValueOTP] = useState(false);
    const [validateIsBotton, setvalidateIsBotton] = useState(false);
    const [allowBack, setAllowBack] = useState(false);
    const btnRef = useRef<any>(null);
    const router = useRouter();
    const heightValue = heightCaldulate();
    const [sasToken, setSasToken] = useState("");
    const orderId = initialGuide?.pedidos?.[0]?.id;
    const [checkUbication, setCheckUbication] = useState(false);
    const [showNoDeliveryModal, setShowNoDeliveryModal] = useState(false);
    const [selectedNoDeliveryCause, setSelectedNoDeliveryCause] = useState<Cause | null>(null);
    const [uploadPhotoNoDelivery, setUploadPhotoNoDelivery] = useState(false);
    const [noDeliveryFiles, setNoDeliveryFiles] = useState<string[]>([]);
    const [confirmNoDelivery, setConfirmNoDelivery] = useState(false);
    const [uploadPhotoTwo, setUploadPhotoTwo] = useState(false);
    const [currentQRType, setCurrentQRType] = useState(qrType || undefined);
    const [currentQRData, setCurrentQRData] = useState(qrBase64 || undefined);

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
        // router.back();
        if (detailsCounterDelivery) {

            await deletePaymentByOrder();

            router.push({
                pathname: '/views/IndexDetailsInvoice',
                params: {
                    guide: JSON.stringify(guide),
                    numberGuide: numberGuide,
                    token: token ?? "",
                }
            });
        } else {
            router.push(
                `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
            );
        }
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
        if (conceptDelivery?.tipoEntrega?.codigo) {
            setvalidateIsBotton(false);
        }
    }, [token]);

    useEffect(() => {

        const fetchGuide = async () => {
            try {
                const respones = await invoiceRepositoryImpl.successfulBillPaymentTwo(
                    Number(initialGuide?.facturas[0]?.numeroFactura),
                    token,
                    Number(initialGuide?.pedidos?.[0]?.id),
                );

                if (respones?.statusCode === 200) {
                    setPaymentSuccessful(respones.data as Invoice);
                }
            } catch (error) {
                setModalTitle("¡Error!");
                setModalMessage("Ocurrio un error inesperado.");
                setModalVisible(true);
            }
        };
        getDataProduct();
        listTypeCash();
        // getSuccessOrderPayment();
        fetchGuide();
    }, [Number(initialGuide?.facturas[0]?.numeroFactura), token]);

    const handleGenerateQR = (type: string, qr?: string) => {
        if (condPago) {
            setModalgenerateQR(true);
            setShowDetailInvoiceQR(false);
            setShowPayment(false);
            if (qr) {
                setQrBase64(qr);
                setCurrentQRData(qr);
            }
            if (type) {
                setQrType(type);
                setCurrentQRType(type);
            }
        }

    };

    const deletePaymentByOrder = async () => {
        try {
            await detailsRepositoryImpl.deleteByOrder(token, String(orderId),);

        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };
    const handleGenerateQRNotcondPago = async (type: string, qr?: string) => {
        setModalgenerateQR(true);
        setShowDetailInvoiceQR(false);
        setShowPayment(false);
        if (qr) {
            setQrBase64(qr);
            setCurrentQRData(qr);
        }
        if (type) {
            setQrType(type);
            setCurrentQRType(type);
        }
    };


    const handleSubmitEfecty = async (value: number) => {
        try {
            setLoading(true);
            setRefreshingOnPress(true);
            if (value <= 0) {
                setModalTitle("¡Alerta!");
                setModalMessage("El campo es requerido.");
                setModalVisible(true);
                return;
            }
            const now = new Date();

            const date = now.toLocaleString('sv-SE', {
                timeZone: 'America/Bogota',
                hour12: false
            }).replace('T', ' ');
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));

            const response = await invoiceRepositoryImpl.createPaymentType([
                {
                    usuario: decoded.transportador ? decoded.transportador : "N/A",
                    momento: date,
                    valorRegistrado: value,
                    tipoPago: "TIP_PAG_EFECTIVO",
                    descripcion: "Transferencia",
                    pedidos: [String(initialGuide?.pedidos?.[0]?.codigo)],
                }
            ], token);

            if (response?.statusCode === 200) {
                onRefresh();
                setModalTitle("¡Procesado!");
                setModalMessage(`Registro(s) procesado exitosamente.`);
                setModalVisible(true);

            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
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
                    isSelectInvocies: isSelectInvocies ? 'true' : undefined,
                }
            });
            setLoading(false);

        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        }
    };

    const listTypeCash = async () => {
        try {
            setLoading(true);

            const now = new Date();

            const date = now.toLocaleString('sv-SE', {
                timeZone: 'America/Bogota',
                hour12: false
            }).replace('T', ' ');

            const response = await invoiceRepositoryImpl.getTypeCash(token);
            if (response?.statusCode === 200 && Array.isArray(response.data)) {
                setTypeCash(response.data);
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
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

    const handleSubmitOthers = async (value: number, observation?: string) => {
        try {
            setLoading(true);
            setRefreshingOnPress(true);
            if (value <= 0) {
                setModalTitle("¡Alerta!");
                setModalMessage("El campo es requerido.");
                setModalVisible(true);
                return;
            }

            if (!observation) return;

            const now = new Date();

            const date = now.toLocaleString('sv-SE', {
                timeZone: 'America/Bogota',
                hour12: false
            }).replace('T', ' ');

            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));


            const response = await invoiceRepositoryImpl.createPaymentType([
                {
                    usuario: decoded.transportador ? decoded.transportador : "N/A",
                    momento: date,
                    valorRegistrado: value,
                    tipoPago: "TIP_PAG_OTRO",
                    descripcion: String(observation),
                    pedidos: [String(initialGuide?.pedidos?.[0]?.codigo)],
                }
            ], token);

            if (response?.statusCode === 200) {
                onRefresh();
                setModalTitle("¡Procesado!");
                setModalMessage(`Registro(s) procesado exitosamente.`);
                setModalVisible(true);

            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado 3.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 1.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    const condPago = guide?.facturas[0]?.condPago === TypeConPagoEnum.TAT;

    // const condPagoFalse = guide?.facturasx0]?.condPago != TypeConPagoEnum.TAT;

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

            // if (!deliveryStatus) {
            //     setModalTitle("¡Alerta!");
            //     setModalMessage("Debe especificar un estado de entrega.");
            //     setModalVisible(true);
            //     return;
            // }
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
                            isSelectInvocies: isSelectInvocies

                        }
                    });
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
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 1.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!Number.isFinite(totalValue) || !Number.isFinite(totalRecauder) || !Number.isFinite(totalOrderPayment)) {
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Los valores aún no están listos, espere un momento.");
                setModalVisible(true);
                return;
            }
            setLoading(true);
            setvalidateIsBotton(true);
            setEntryVisible(true);
            setShowDetailInvoiceQR(false);
            setShowPayment(false);

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            if (guide?.latitud && guide?.longitud) {
                const distance = getDistanceInMeters(Number(guide?.latitud), Number(guide?.longitud), Number(location.coords.latitude), Number(location.coords.longitude));
                const isInsideRange = distance <= 100;
                if (!isInsideRange) {
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
                btnRef.current?.reset();

                router.push({
                    pathname: '/views/IndexDetailsInvoice',
                    params: {
                        guide: JSON.stringify(guide),
                        numberGuide: numberGuide,
                        token: token ?? "",
                    }
                });

                setvalidateIsBotton(true);
                setEntryVisible(true);
                // setRouteStarted(true);

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
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 2.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeQRType = async () => {
        try {

            // Cambiar el tipo (alternar entre tipos disponibles)
            const newType = currentQRType === 'Aplicación Bancaria' ? 'Pasarela' : 'Aplicación Bancaria';
            setCurrentQRType(newType);
            // Limpiar datos anteriores
            setCurrentQRData(undefined);

        } catch (error) {
            console.error('Error al cambiar tipo de QR:', error);
        }
    };

    const getDataProduct = async () => {
        try {
            setLoading(true);
            if (token && Number(orderId)) {
                const responseQuery = await detailsRepositoryImpl.listPorductData(token, Number(orderId));
                if (responseQuery?.statusCode == 200) {
                    setLoading(false);
                    if (typeof responseQuery.data === "object" && !Array.isArray(responseQuery.data)) {
                        setPorductData(responseQuery.data ? [responseQuery.data] : []);
                    }

                }
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 3.");
            setModalVisible(true);
        } finally {
        }
    };


    //         const response = await detailsRepositoryImpl.listInfOTP(String(guide?.idDireccion), String(initialGuide?.facturas[0]?.numeroFactura), token);
    //         if (
    //             response.success &&
    //             response.data &&
    //             typeof response.data !== "string" &&
    //             !Array.isArray(response.data)
    //         ) {
    //             if (response.data.expira_en && response.data.momento_envio && guide) {
    //                 setButtonValueOTP(true);
    //                 router.push({
    //                     pathname: '/views/IndexDetailsInvoice',
    //                     params: {
    //                         guide: JSON.stringify(guide),
    //                         numberGuide: numberGuide,
    //                         token: token ?? "",
    //                         confirmationStatus: 'true',
    //                         responseOTPInit: JSON.stringify(response.data),
    //                         totalValue: Number(totalValue) ?? 0,
    //                         totalRecauder: Number(totalRecauder) ?? 0,
    //                         totalOrderPayment: Number(totalOrderPayment) ?? 0,
    //                         expireDate: 'true',
    //                         isSelectInvocies: isSelectInvocies
    //                     }

    //                 });
    //                 return true;
    //             }
    //         }
    //         return false;

    //     } catch (error: any) {
    //         setModalTitle("¡Error!");
    //         setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 4.");
    //         setModalVisible(true);
    //     }
    // };


    const submitData = async () => {
        try {
            if (!conceptDelivery?.tipoEntrega?.codigo) {
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
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 5.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const validateButton = () => {
        try {
            setShowDetailInvoiceQR(false);
            setShowPayment(false);
            // setShowDetailInvoiceQR(false);
            // setShowPayment(false);
            if (!routeStarted && !isSelectInvocies && !detailsCounterDelivery && !closeButton) {
                setModalTitle("¡Alerta!");
                setModalMessage("Debe indicar que ya llegó al lugar de la dirección para poder ejecutar esta acción.");
                setModalVisible(true);
                return false;
            }

            if (condPago && condPago) {
                setTypeQRSendWhatsApp(true);
                setModalgenerateQR(true);
                setShowDetailInvoiceQR(true);
                setRouteStarted(true);
            } else if (!condPago && !condPago) {
                setRouteStarted(true);
                setTypeQRSendWhatsApp(false);
                setShowDetailInvoiceQR(false);
            }
            // if (condPago) {
            //     setTypeQRSendWhatsApp(true);
            //     setModalgenerateQR(true);
            //     setShowDetailInvoiceQR(true);
            // }
            return true;
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 6.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }

    const getSuccessOrderPayment = async () => {
        try {

            const responseQueryData = await invoiceRepositoryImpl.successOrderPayment(
                Number(initialGuide?.pedidos?.[0]?.id),
                token
            );
            if (responseQueryData?.statusCode === 200 && Array.isArray(responseQueryData.data)) {
                const total = responseQueryData.data
                    .map(item => Number(item.valorRegistrado ?? 0))
                    .reduce((a, b) => a + b, 0);

                setValuePaymentByType(total);
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 7.");
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
                            facturas: clienteEncontrado.facturas,
                            whatsapp: clienteEncontrado.whatsapp,
                            pedidos: clienteEncontrado.pedidos
                        });

                    }
                }


                const responeData = await invoiceRepositoryImpl.successfulBillPaymentTwo(
                    Number(initialGuide?.facturas[0]?.numeroFactura),
                    token,
                    Number(initialGuide?.pedidos?.[0]?.id),
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
                            referencia: pago.referencia,
                            descripcion: pago.descripcion ?? null,
                        }))
                    });

                }

                // getSuccessOrderPayment();
                setRefreshing(false);
            }, 2000);
        } catch (error) {
            setRefreshing(false);
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 8.");
            setModalVisible(true);
        } finally {
            setLoading(false);
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

                // if (guide?.facturas && guide.facturas.length > 0) {
                //     guide.facturas.forEach((factura, index) => {
                //         facturasArray.push({
                //             ruta: String(numberGuide),
                //             documentMeico: String(factura.numeroFactura),
                //             direccion: Number(guide?.idDireccion),
                //             causal: showOptionRefused === OptionsRefusedEnum.DINERO
                //                 ? CausalDelivery.DINERO_INSUFICIENTE
                //                 : showOptionRefused === OptionsRefusedEnum.DUEÑO
                //                     ? CausalDelivery.DUENO_NO_CONTESTA
                //                     : showOptionRefused === OptionsRefusedEnum.TIENDA
                //                         ? CausalDelivery.TIENDA_CERRADA
                //                         : showOptionRefused === OptionsRefusedEnum.PRODUCTOS
                //                             ? CausalDelivery.PRODUCTOS_DANADOS
                //                             : null,
                //             estado: "ACT_EST_ENTREGA",
                //             files:
                //                 showStatusDelivery === StatusDelivery.RECHAZADO
                //                     ?
                //                     showOptionRefused === OptionsRefusedEnum.TIENDA
                //                         ? multiplePhotos.map((item) => ({
                //                             tipoEntrega: TypeDelivery.RECHAZADO,
                //                             rutaArchivo: item.base64 ?? null,
                //                         }))
                //                         : []
                //                     :
                //                     multiplePhotos.map((item) => ({
                //                         tipoEntrega:
                //                             showStatusDelivery === StatusDelivery.TOTAL
                //                                 ? TypeDelivery.ENT_TOTAL
                //                                 : showStatusDelivery === StatusDelivery.PARCIAL
                //                                     ? TypeDelivery.ENT_PARCIAL
                //                                     : TypeDelivery.RECHAZADO,
                //                         rutaArchivo: item.base64 ?? null,
                //                     })),

                //         });
                //     });
                //     setShowOptionRefused(null);
                // }

                // if (facturasArray.length > 0) {
                //     responses = await Promise.all(
                //         facturasArray.map(facturaData =>
                //             invoiceRepositoryImpl.createDelivery(facturaData, token)
                //         )
                //     );
                //     console.log("responses: ",responses);

                //     // Verificar si todas las respuestas fueron exitosas
                //     const success = responses.every((resp: any) =>
                //         resp?.statusCode === 200 || resp?.success === true
                //     );

                if (response?.success) {
                    listDocumentQuery();
                    setModalTitle("¡Procesado!");
                    setModalMessage(`Soporte(s) procesados exitosamente.`);
                    setModalVisible(true);
                    setvalidateIsBotton(false);
                } else {
                    setLoading(false);
                    // Opcional: mostrar detalles del primer error
                    // const oneError = responses.find((resp: any) =>
                    //     !(resp?.statusCode === 200 || resp?.success === true)
                    // );
                    setModalTitle("Alerta");
                    setModalMessage("Error inesperado.");
                    setModalVisible(true);
                }
            }
        } catch (error) {
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


    useEffect(() => {
        const init = async () => {
            const token = await SecureStore.getItemAsync("service_token");
            setSasToken(token || "");

        };
        init();

    }, []);


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
                    `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(showResultData))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
                );
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 11.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            listDocumentQuery();
        }
    }, [token]);

    useEffect(() => {
        const fetchGuideList = async () => {
            try {
                if (routeStarted && isCountryDelivery) {
                    const response = await detailsRepositoryImpl.listGuide(
                        Number(numberGuide),
                        token
                    );
                    if (response?.statusCode === 200 && response?.data && Array.isArray(response.data)) {
                        setGuideAny(response.data);

                        const data = response.data;
                        const numeroFactura = guide?.facturas?.[0]?.numeroFactura;
                        const result = data.find(item =>
                            item.facturas.some(f => f.numeroFactura === numeroFactura)
                        );
                        setResultData(result ?? null);
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

        fetchGuideList();
    }, [routeStarted, isCountryDelivery]);

    useEffect(() => {
    }, [condPago || buttonValue]);

    const totalAproved = paymentSuccessful?.pagos
        ?.filter(pago => pago.estado === "APPROVED")
        .reduce((sum, pago) => sum + (Number(pago?.valorPagado) || 0), 0);

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

    useEffect(() => {
        if (showPorductData) {
            const total =
                showPorductData?.[0]?.detalles?.reduce((suma, detalle) => {
                    return (
                        suma +
                        calculateVlueByPorducts(
                            detalle as Detail,
                            TypeCaculateValueEnum.ACTION_3,
                            undefined,
                            undefined,
                            Number(showPorductData?.[0]?.porcentajeDFR)
                        )
                    );
                }, 0) || 0;

            setValueOrderCalculate(total);
        }
    }, [
        token,
        closeButton,
        detailsCounterDelivery,
        showPorductData,
    ]);

    const totalOrderPayment = Number(totalAproved);
    // const totalImpuestos = showPorductData
    //     ?.flatMap(p => p.detalles || [])
    //     .reduce((acc, detalle) => acc + Number(detalle?.totalImpuestos || 0), 0);

    // const totalImpuestoValues = Number(totalImpuestos);

    const totalValue =
        Number(
            (
                (Number(guide?.facturas[0]?.valorTotal) -
                    Number(guide?.facturas[0]?.dfr)) -
                Number(valueOrderCalculate)
            ).toFixed(2)
        );

    const totalValueTwo =
        Number(
            (
                (Number(guide?.facturas[0]?.valorTotal) -
                    Number(guide?.facturas[0]?.dfr))
            ).toFixed(2)
        );


    const condition = detailsCounterDelivery || closeButton;

    const baseTotal = condition
        ? Number(newTotalValue || 0) - Number(totalAproved)
        : Number(totalValueTwo || 0);

    const totalRecauder = condition
        ? baseTotal
        : baseTotal;


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
                            totalValue: Number(totalValue) ?? 0,
                            totalRecauder: Number(totalRecauder) ?? 0,
                            totalOrderPayment: Number(totalOrderPayment) ?? 0,
                            expireDate: 'true',
                            isSelectInvocies: isSelectInvocies
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

    useEffect(() => {
        if (buttonValueOTP || isSelectInvocies === 'true') return;
        const totalApprovedPayments = paymentSuccessful?.pagos
            ?.filter(pago => pago.estado === "APPROVED")
            .reduce((sum, pago) => sum + (Number(pago?.valorPagado) || 0), 0) || 0;

        if (buttonValueOTP) return;

        const executeLogic = async () => {
            if (totalApprovedPayments > 0) {
                setModalVisible(false);
                await listInfOTByDirection();
            }
        };
        executeLogic();

        const interval = setInterval(() => {
            executeLogic();
        }, 5000);

        return () => {
            clearInterval(interval);
        };

    }, [paymentSuccessful, buttonValueOTP]);

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


            if (!guide?.whatsapp || guide?.whatsapp == "") {
                btnRef.current?.reset();
                setModalTitleValidate("Evidencia requerida");
                setModalMessageValidate("Para finalizar la entrega del pedido debes");
                setHighlightText("Registrar evidencia.");
                setModalButtonLabelValidate("Registrar evidencia");
                setModalVisibleValidate(true);
                return;
            }

            setLoading(true);

            setButtonValueOTP(true);

            const responseData = await detailsRepositoryImpl.sendOTP(
                {
                    idDireccion: Number(guide?.idDireccion),
                    numeroFactura: String(guide?.facturas?.[0]?.numeroFactura),
                    numeroDestino: "+57" + String(guide?.whatsapp).replace(/\D/g, ''),
                    // numeroDestino: "+573112187956",
                    valorOriginal: String(totalValue),
                    valorPagado: String(totalOrderPayment),
                },
                token
            );
            if (responseData?.statusCode === 200) {
                btnRef.current?.reset();
                setLoading(true);
                router.push({
                    pathname: '/views/IndexDetailsInvoice',
                    params: {
                        guide: JSON.stringify(guide),
                        numberGuide: numberGuide,
                        token: token ?? "",
                        confirmationStatus: 'true',
                        responseOTPInit: JSON.stringify(responseData.data),
                        totalValue: String(totalValue) ?? 0,
                        totalRecauder: String(totalRecauder) ?? 0,
                        totalOrderPayment: String(totalOrderPayment) ?? 0,
                        isViewDetailsPorducts: 'true',
                        isSelectInvocies: isSelectInvocies
                    }

                });
            } else {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(responseData?.message || "No se pudo iniciar la ruta. Intente nuevamente.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setValidateException(true);
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 222.");
            setModalVisible(true);
        }
    };
    useEffect(() => {

        const hasRejected = showPorductData?.some(pedido =>
            pedido?.detalles?.some(detalle => detalle?.unidadesRechazadas > 0)
        );

        if (!hasRejected) {
            setNewTotalValue(totalValue);
            return;
        }

        const result = calculateValuesDFRArray(showPorductData);

        setNewTotalValue(result);

    }, [showPorductData]);

    const discount = Number(guide?.facturas[0]?.dfr ?? 0);
    const isZero = discount === 0;
    const isValidateCondition = (detailsCounterDelivery || closeButton || isViewDetailsPorducts);
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
                            {(isValidateCondition) && (
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
                                {(isValidateCondition) && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Productos rechazados</Text>
                                        <Text style={styles.value}>{'$ ' + Number(valueOrderCalculate).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                                    </View>
                                )}
                                <View style={styles.row}>
                                    <Text style={styles.labelTotal}>Valor total</Text>
                                    <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                                        {'$ ' + (
                                            Number(
                                                (detailsCounterDelivery || closeButton)
                                                    ? (newTotalValue)
                                                    : totalValueTwo || 0
                                            ).toLocaleString('es-CO', { minimumFractionDigits: 0 })
                                        )}
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
                                            color: Math.max(0, baseTotal) === 0 ? '#1F9144' : '#C62828',
                                            fontWeight: '800',
                                            fontSize: 16
                                        }
                                    ]}>
                                        {'$ ' + (Math.max(0, baseTotal) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                    </Text>
                                </View>

                                {(isValidateCondition) && (
                                    totalRecauder != 0 ? (
                                        <TouchableOpacity
                                            style={styles.qrButton}
                                            onPress={() => {
                                                const isValidButton = validateButton();
                                                if (!isValidButton) return;
                                                setTypePayment(true);
                                            }}
                                        >
                                            <View style={styles.qrButtonContent}>
                                                <Text style={styles.qrButtonText}>Registrar pago</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.qrButtonDetail}
                                            onPress={() => { setShowPayment(true) }}
                                        >
                                            <Text style={styles.qrButtonText}>Detalle de pagos</Text>
                                        </TouchableOpacity>
                                    )
                                )}

                            </View>

                        </View>

                        {(!detailsCounterDelivery && !closeButton) && (
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

            {guide && Number.isFinite(totalValue) && Number.isFinite(totalRecauder) && Number.isFinite(totalOrderPayment) && (

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
                                    setLoading(false);
                                    setConfirmNoDelivery(false);
                                    setSelectedNoDeliveryCause(null);
                                    setNoDeliveryFiles([]);
                                }
                            }}
                            disabled={false}
                            width={328}
                            height={43}
                        />
                    ) : (!isViewDetailsPorducts && isSelectInvocies) ? (
                        <PrimaryButton
                            title="Entregar"
                            onPress={handleSubmitData}
                            disabled={false}
                            width={328}
                            height={43}
                        />
                    ) : detailsCounterDelivery ? (
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
                                    key={closeButton ? "cerrar" : "llegue"}
                                    title={closeButton ? "Cerrar pedido" : "Ya llegué"}
                                    onPress={closeButton ? submitData : handleSubmit}
                                    disabled={false}
                                    width={328}
                                    height={43}
                                    buttonColor={conceptDelivery ? undefined : closeButton ? "#DDDFE8" : undefined}
                                    buttonColorEnd={conceptDelivery ? undefined : closeButton ? "#DDDFE8" : undefined}
                                    titleColor={conceptDelivery ? undefined : closeButton ? "#FFFFFF" : undefined}
                                    circleColor={conceptDelivery ? undefined : closeButton ? "#788095" : undefined}
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

            {(showDetailInvoiceQR) && (
                <DetailsInvoiceQR
                    data={guide}
                    onClose={() => setShowDetailInvoiceQR(false)}
                    onChangePhone={() => {
                        setShowDetailInvoiceQR(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    onGenerateQR={condPago ? handleGenerateQR : handleGenerateQRNotcondPago}
                    onPressPayment={() => setRefreshingOnPress(true)}
                    onErrorPayment={() => setShowErrorQRP(true)}
                    statusTypeQR={typeQRSendWhatsApp}
                    totalRecauder={totalRecauder}

                />
            )}

            {modalgenerateQR && (
                <ViewQrModal
                    data={guide}
                    onClose={() => {
                        setModalgenerateQR(false);
                        setCurrentQRData(undefined);
                    }}
                    onChangePhone={() => {
                        setShowDetailInvoiceQR(false);
                        setShowPayment(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    qrData={currentQRData}
                    qrType={qrType}
                    onChangeQRType={() => {
                        handleChangeQRType();
                        setShowDetailInvoiceQR(true);
                        setModalgenerateQR(false);
                    }}
                    onSendWhatsApp={handlSendWhatsApp}
                    totalRecauder={totalRecauder}

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

            {(typePayment && !condPago && guide) && (
                <TypePayment
                    title="Registrar pago"
                    subTitle="Seleccioná el método de pago del cliente."
                    onClose={() => {
                        setTypePayment(false);
                        // setAlertButton(false);
                        // setSuccessButton(false);
                    }}
                    width={width}
                    onEfecty={() => {
                        setTypePayment(false);
                        setTypePaymenTypeEfecty(true);
                    }}
                    onOthers={() => {
                        setTypePaymenTypeOthers(true);
                        setTypePayment(false);
                        setTypePaymenTypeEfecty(false);
                    }}
                    onQr={() => {
                        setTypePayment(false);
                        setTypePaymenTypeEfecty(false);
                        setShowDetailInvoiceQR(true);
                    }}
                    guide={guide}
                    typeCash={typeCash}
                />
            )}

            {typePaymentTypeEfecty && (
                <DetailsPaymenTypeEfecty
                    data={guide}
                    onClose={() => setTypePaymenTypeEfecty(false)}
                    onChangePhone={() => {
                        setTypePaymenTypeEfecty(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    onGenerateQR={handleGenerateQR}
                    onPressPayment={(value) => {
                        if (value) {
                            setTypePaymentView(true);
                            setNewValue(value)
                            handleSubmitEfecty(value);
                        }
                    }}
                    onErrorPayment={() => setShowErrorQRP(true)}
                    statusTypeQR={typeQRSendWhatsApp}
                    totalRecauder={totalRecauder}

                />
            )}
            {typePaymentTypeOthers && (
                <DetailsPaymenTypeOthers
                    data={guide}
                    onClose={() => setTypePaymenTypeOthers(false)}
                    onChangePhone={() => {
                        setTypePaymenTypeEfecty(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    onGenerateQR={handleGenerateQR}
                    onPressPayment={(value, observation) => {
                        handleSubmitOthers(Number(value), observation)
                    }}
                    onErrorPayment={() => setShowErrorQRP(true)}
                    statusTypeQR={typeQRSendWhatsApp}
                    totalRecauder={totalRecauder}
                />
            )}

            {(uploadPhotoTwo) && (
                <UploadPhotoOTP
                    onClose={() => setUploadPhotoTwo(false)}
                    onPick={(data) => {
                        const newPhoto: EvidencePhoto = {
                            id: Date.now().toString(), // Generar un ID único
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

