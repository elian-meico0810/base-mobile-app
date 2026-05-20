import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { ExcetptionModalProducts } from '@/components/generals/ExcetptionModalProducts';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { ExecptionModalCancel } from '@/components/generals/ExecptionModalCancel';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { GuideDetailSkeleton } from '@/components/skeleton/GuideDetailSkeleton';
import { ThemedView } from '@/components/themed-view';
import { TypeDetailsEnum, TypeStatusEnum } from '@/src/constants/GuideStates';
import { ProductValidationOrderRefused } from '@/src/features/detailsInvoice/components/ProductValidationOrderRefused';
import { ReportNoveltyScreen } from '@/src/features/detailsInvoice/components/ReportNoveltyScreen';
import { ChangeCodeModal } from '@/src/features/tracking/components/screens/ChangeCodeModal';
import { Cause, OrderGroup, ProductoPedido } from '@/src/features/tracking/domain/details/DetailsGuide';
import { AceptationPedidoProps, CustomerAddress, NoveltyCarguePayload, NoveltyOrderPayload, Order } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { MaterialIcons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Keyboard, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface InfoInvoiceFormProps {
    token?: string;
    onSubmit: (params: { guide: CustomerAddress; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    IsGoBack?: boolean;
    routeStartedBotton?: string;
    detailsCounterDelivery?: boolean;
    detailsOrder?: string;
    OrderArray?: OrderGroup;

}

interface ReasonData {
    type: string;
    units: number;
    description?: string;
    codigo?: string;
}

export function ViewDetailsPorductsOrder({
    token = "",
    onSubmit,
    numberGuide,
    isSelectInvocies,
    documentMeico,
    isCountryDelivery = false,
    IsGoBack = false,
    routeStartedBotton,
    detailsCounterDelivery,
    detailsOrder,
    OrderArray
}: InfoInvoiceFormProps) {
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sasToken, setSasToken] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalMessageAlert, setModalMessageAlert] = useState("");
    const [showModalPone, setModalPone] = useState(true);
    const [modalVisibleCancel, setModalVisibleCancel] = useState(false);
    const [modalTitleCancel, setModalTitleCancel] = useState("");
    const [modalMessageCancel, setModalMessageCancel] = useState("");
    const [isRejected, setIsRejected] = useState(false);
    const [modalButtonLabelCancel, setModalButtonLabelCancel] = useState("Entendido");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [products, setPorductData] = useState<OrderGroup[]>([]);
    const [modalVisibleValidate, setModalVisibleValidate,] = useState(false);
    const [modalTitleValidate, setModalTitleValidate] = useState("");
    const [modalMessageValidate, setModalMessageValidate] = useState("");
    const [modalButtonLabelValidate, setModalButtonLabelValidate] = useState("Entendido");
    const [uploadPhotoNoDelivery, setUploadPhotoNoDelivery] = useState(false);
    const [noDeliveryFiles, setNoDeliveryFiles] = useState<string[]>([]);
    const [confirmNoDelivery, setConfirmNoDelivery] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [modalStatusNovelty, setStatusNovelty] = useState<'left' | 'right' | null>(null);
    const [successButton, setSuccessButton] = useState(false);
    const [showNovelty, setNovelty] = useState(false);
    const [showViewModal, setViewModal] = useState(false);
    const [dataNovelty, setDataNovelty] = useState<ReasonData[]>([]);
    const [showTypeDetails, setTypeDetails] = useState<Cause[]>([]);
    const [refreshing, setRefreshingOnPress] = useState(false);
    const [alertButton, setAlertButton] = useState(false);
    const [productItemDataPending, setProductItemDataPending] = useState<OrderGroup[]>([]);
    const [productItemData, setProductItemData] = useState<OrderGroup | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductoPedido | null>(null);
    const [showChangeCode, setShowChangeCode] = useState(false);
    const [showNotEntry, setShowNotEntry] = useState(false);
    const [modalButtonLabelTwo, setModalButtonLabelTwo] = useState("Entendido");
    const [modalTitleTwo, setModalTitleTwo] = useState("");
    const [modalMessageTwo, setModalMessageTwo] = useState("");
    const [modalVisibleTwo, setModalVisibleTwo] = useState(false);
    const [showError, setsError] = useState(false);
    const [showErrorMessages, setsErrorMessages] = useState("");
    const [showErrorTitle, setsErrorTitle] = useState("");
    const [showSuccess, setSuccess] = useState(false);
    const [showSuccessMessages, setSuccessMessages] = useState("");
    const [showSuccessTitle, setSuccessTitle] = useState("");

    const btnRef = useRef<any>(null);
    const router = useRouter();


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

    const handleSubmitReject = async () => {
        try {
            setLoading(true);

            const response = await invoiceRepositoryImpl.apporveOrReject(
                {
                    guia_id: Number(numberGuide),
                    is_acceptation: false
                }, token);

            if (response?.statusCode === 200) {
                await SecureStore.deleteItemAsync('user_token');
                setTimeout(() => {
                    setLoading(false);
                    router.replace({
                        pathname: '/auth/login',
                        params: {
                            message: `El documento de transporte ${numberGuide} ha sido rechazado`
                        }
                    });
                }, 1200);
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage("Problemas al aceptar la guía, contacta con el área de soporte.");
                setModalVisible(true);
            }
        } catch (error: any) {
            btnRef.current?.reset();
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado 1.");
            setModalVisible(true);
        }
    };


    useEffect(() => {
        const init = async () => {
            const token = await SecureStore.getItemAsync("service_token");
            setSasToken(token || "");

        };
        init();

    }, []);

    const handleAlertButton = async () => {
        if (alertButton) {
            await submitDataByActionsAlert();
        }
    };

    useEffect(() => {
        handleAlertButton();
    }, [alertButton]);

    const uploadPhotoSubmit = async (evidences: string[]) => {
        try {
            setLoading(true);
            const response = await invoiceRepositoryImpl.uploadEvidenceAcceptationGuides(
                {
                    codigo_guia: String(numberGuide),
                    files: evidences
                }, token);

            if (response?.statusCode === 200) {
                const responseData = await invoiceRepositoryImpl.apporveOrReject(
                    {
                        guia_id: Number(numberGuide),
                        is_acceptation: true
                    }, token);

                if (responseData?.statusCode === 200) {
                    setLoading(false);
                    return;
                } else {
                    setModalTitle("¡Alerta!");
                    setModalMessage(responseData?.message ?? "Ocurrió un error inesperado.");
                    setModalVisible(true);
                }
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
                setModalVisible(true);
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado 2.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleExit = async (success: boolean = false) => {
        setLoading(true);

        router.push({
            pathname: '/views/AcceptanceTerms' as any,
            params: {
                numberGuide: Number(numberGuide),
                token: String(token),
                OrderArray: encodeURIComponent(JSON.stringify(OrderArray)),
                showSuccess: success ? "true" : null
            }
        });
    };
    const handleAceptataionOrder = async (pedido?: Order) => {
        try {
            setLoading(true);
            console.log("handleAceptataionOrder: ", handleAceptataionOrder)
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const getDataProduct = async () => {
        try {
            setLoading(true);

            const hasCargue =
                OrderArray?.cargue &&
                OrderArray?.cargue !== "None" &&
                OrderArray?.cargue?.trim() !== "";

            const responseQuery = await detailsRepositoryImpl.listAceptationOrderDetails(
                token,
                Number(numberGuide),
                hasCargue ? null : String(OrderArray?.codigo),

                hasCargue ? String(OrderArray?.cargue) : null
            );

            if (responseQuery?.statusCode === 200) {
                setPorductData(
                    Array.isArray(responseQuery.data)
                        ? responseQuery.data.flat()
                        : []
                );
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperadoss.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCode = async (code: string) => {
        try {
            await handleValidateCode(code)
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
            await handleRejectOrderTwo()

        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectOrder = async () => {
        try {
            setLoading(true);

            console.log("llego aca handleRejectOrder");

        } catch (error: any) {
            setModalTitle("¡Alerta!");
            setModalMessage("Problemas al guardar la novedad del pedido.");
            setModalVisible(true);

            setTimeout(() => {
                setModalVisible(false);
            }, 6000);
            return;

        } finally {
            setLoading(false);
        }
    };


    const getRefused = async () => {
        try {
            const responseQuery = await detailsRepositoryImpl.listTypeDetails(TypeDetailsEnum.CAUS_REP_PEDIDO, token);

            if (responseQuery?.statusCode == 200) {
                const data = responseQuery.data;

                if (Array.isArray(data)) {
                    setTypeDetails(data);
                } else {
                    setTypeDetails([]);
                }
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(responseQuery.message || "Ocurrio un error inesperado.");
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

    const submitDataByActionsAlert = async () => {
        try {
            const totalUnits = dataNovelty.reduce(
                (acc, item) => acc + (item.units || 0),
                0
            );

            if (modalVisible || totalUnits == 0) return;
            setLoading(true);

            if (alertButton && selectedProduct) {
                const hasCargue = Boolean(
                    OrderArray?.cargue &&
                    OrderArray?.cargue !== "None" &&
                    OrderArray?.cargue?.trim() !== ""
                );

                if (totalUnits > selectedProduct.unidades_solicitadas) {
                    setAlertButton(false);
                    setModalTitle("¡Cantidad inválida!");
                    setModalMessage("Las unidades ingresadas del producto exceden la cantidad facturada, verifíque.");
                    setModalVisible(true);
                    setLoading(false);
                    return;
                }
                let response;
                if (hasCargue) {
                    const payload: NoveltyCarguePayload = {
                        cargue: String(OrderArray?.cargue),
                        producto: String(selectedProduct?.producto?.codigo),
                        unidades_rechazadas: selectedProduct?.unidades_rechazadas,
                        unidades_solicitadas: selectedProduct?.unidades_solicitadas,
                        total_entregado: selectedProduct?.total_entregado,
                        total_impuesto_entrega: selectedProduct?.total_impuesto_entrega,
                        valor_base_producto: selectedProduct?.valor_base_producto,
                        total_impuestos: selectedProduct?.total_impuestos,
                        novedad: dataNovelty
                            .filter(
                                (item): item is typeof item & { codigo: string } =>
                                    item.units > 0 && !!item.codigo
                            )
                            .map(item => ({
                                cantidad: item.units,
                                codigo: item.codigo
                            }))
                    };

                    response = await invoiceRepositoryImpl.reportNoveltyCargue(payload, token);
                } else {
                    const payload: NoveltyOrderPayload = {
                        aceptacion_pedido_detalle: selectedProduct.id,

                        novedad: dataNovelty
                            .filter(
                                (item): item is typeof item & { codigo: string } =>
                                    item.units > 0 && !!item.codigo
                            )
                            .map(item => ({
                                cantidad: item.units,
                                codigo: item.codigo
                            }))
                    };

                    response = await invoiceRepositoryImpl.reportNovelty(payload, token);
                }

                if (response?.statusCode === 200) {
                    setAlertButton(false);
                    setIsRejected(true);
                    setModalTitle("¡Procesado!");
                    setModalMessage(`Novedad registrada con éxito.`);
                    setModalVisible(true);

                    setDataNovelty([]);
                    setSelectedProduct(null);
                    setStatusNovelty(null);
                    setNovelty(false);

                    setTimeout(() => {
                        getDataProduct();
                    }, 500);

                    return;
                } else {
                    setModalTitle("¡Alerta!");
                    setModalMessage(response.message || "Ocurrio un error inesperado.");
                    setModalVisible(true);
                    return;

                }
            }

            await getDataProduct();

        } catch (error) {
            setModalTitle("¡Alerta!");
            setModalMessage("Problemas al guardar la novedad del pedido.");
            setModalVisible(true);
        } finally {
            setLoading(false);
            setAlertButton(false);
        }
    };

    const seendViewDetails = async (status: boolean) => {
        await handleExit(status);

    }
    const handleRejectOrderTwo = async () => {
        try {
            setLoading(true);
            if ((OrderArray?.productos?.length ?? 0) > 0) {
                const hasCargue =
                    OrderArray?.cargue &&
                    OrderArray?.cargue !== "None" &&
                    OrderArray?.cargue?.trim() !== "";
                let response;

                if (hasCargue) {
                    response = await invoiceRepositoryImpl.createNotEntry(
                        {
                            cargue: OrderArray?.cargue,
                            codigo_guia: OrderArray?.codigo_guia ?? "",
                        },
                        token
                    );

                } else {
                    const payload: AceptationPedidoProps = {
                        bodega: OrderArray?.bodega ?? "",
                        canal: OrderArray?.canal ?? "",
                        codigo: OrderArray?.codigo ?? "",
                        codigo_cliente: OrderArray?.codigo_cliente ?? "",
                        codigo_guia: String(numberGuide ?? ""),
                        estado: TypeStatusEnum.EST_PEDI_RECH,
                        producto: OrderArray?.productos?.map((item) => ({
                            CodigoProducto: item?.producto?.codigo?.trim() ?? "",
                            DescripcionProducto: item?.producto?.nombre ?? "",
                            EAN: item?.producto?.ean ?? null,
                            linea: item?.linea ?? 0,
                            unidades_rechazadas: item?.unidades_solicitadas ?? 0,
                            unidades_solicitadas: item?.unidades_solicitadas ?? 0,
                        })) ?? []
                    };

                    response = await invoiceRepositoryImpl.aceptationOrder(
                        payload,
                        token
                    );
                }

                if (response?.statusCode === 200) {
                    setShowChangeCode(false);
                    setSuccessTitle("¡Pedido no recibido!");
                    setSuccessMessages(` Se confirmó que el pedido no fue recibido.`);
                    if (showNotEntry) {
                        seendViewDetails(true);
                    }
                    return;
                } else {
                    setsErrorTitle("Problemas al guardar la novedad del pedido.");
                    setsErrorMessages("¡Alerta!");
                    setsError(true);

                    setTimeout(() => {
                        setsError(false);
                    }, 6000);
                    return;
                }
            }
        } catch (error: any) {
            setsErrorTitle("Problemas al guardar la novedad del pedido.");
            setsErrorMessages("¡Alerta!");
            setsError(true);

            setTimeout(() => {
                setsError(false);
            }, 6000);
            return;

        } finally {
            setLoading(false);
        }
    };
    const hasCargue =
        OrderArray?.cargue &&
        OrderArray?.cargue !== "None" &&
        OrderArray?.cargue?.trim() !== "";

    const handleValidateCode = async (code: string) => {
        try {
            setLoading(true);
            if (OrderArray?.bodega) {
                const hasCargue =
                    OrderArray?.cargue &&
                    OrderArray?.cargue !== "None" &&
                    OrderArray?.cargue?.trim() !== "";
                let response;

                if (hasCargue) {
                    response = await invoiceRepositoryImpl.validateCodeCargue(
                        {
                            bodega: OrderArray?.bodega,
                            codigo: code,
                            cargue: OrderArray?.cargue ?? "",

                        },
                        token
                    );
                } else {
                    response = await invoiceRepositoryImpl.validateCode(
                        {
                            bodega: OrderArray?.bodega,
                            codigo: code,
                            codigo_pedido: OrderArray?.codigo ?? "",
                        },
                        token
                    );
                }
                if (response?.statusCode === 200) {
                    if (showNotEntry) {
                        await handleRejectOrderTwo()
                    } else {
                        seendViewDetails(false);
                    }
                } else {

                    setModalMessageAlert(response.message || "Código inválido")
                    setTimeout(() => {
                        setModalMessageAlert("");
                    }, 6000);
                    return;
                }
            }

        } catch (error: any) {
            setModalTitle("¡Alerta!");
            setModalMessage(error?.message || "Problemas al guardar la novedad del pedido.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getDataProduct();
        getRefused();
    }, [OrderArray, token]);


    return (
        <ThemedView style={styles.container}>
            {/* <NetworkStatus /> */}

            {/* Fondo gris */}
            <View style={styles.background} />

            {/* Header con título */}

            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={()=>
                    {
                        handleExit(false);
                        }}>
                    <Image
                        source={require('@/assets/icons/ExitIcon.png')}
                        style={styles.backIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    Reportar novedad
                </Text>
            </View>

            {/* Card blanco centrado */}

            {!OrderArray ? (
                <GuideDetailSkeleton />
            ) : (
                <>

                    <View style={styles.card}>

                        {/* Línea divisoria */}
                        <View style={styles.orderInfo}>
                            <View style={styles.storeText}>
                                <Text style={styles.labelTwo}>
                                    Documento de transporte {numberGuide}
                                </Text>

                                <Text style={styles.subTitle}>
                                    {OrderArray?.productos?.length ?? 0} Productos
                                </Text>

                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => {

                                        setShowChangeCode(true);

                                        setShowNotEntry(true);
                                    }
                                    }
                                >
                                    <View style={styles.errorDot}>
                                        <MaterialIcons name="close" size={8} color="#FFFFFF" />
                                    </View>

                                    <Text style={styles.rejectButtonText}>
                                        No recibi el pedido
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </>
            )}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/** Listado de productos */}
                <ProductValidationOrderRefused
                    onFinalize={() => {
                        setShowChangeCode(true);
                    }}
                    onSuccessAlet={successButton}
                    onErrorAlert={alertButton}
                    onStatusNovelty={(data) => {
                        setStatusNovelty(data);
                    }}
                    shouldAutoValidate={showNovelty}
                    modalStatusNovelty={modalStatusNovelty}
                    onCloseReportPorduct={(value) => {
                        setViewModal(value);

                    }}
                    data={dataNovelty}
                    // messages={(messages) => {
                    //     setModalTitle("¡Alerta!");
                    //     setModalMessage(messages);
                    //     setModalVisible(true);
                    // }}
                    dataPorduct={products}
                    onItemData={(data) => {
                        setProductItemData(data);

                    }}
                    refreshing={refreshing}
                    onRefreshing={() => {
                        setRefreshingOnPress(false);
                    }}
                    onItemProductsPending={(data) => {
                        if (data.length > 0) {
                            setProductItemDataPending(data);
                        }
                    }}
                    onValidatedProducts={(data) => {
                        if (data) {
                            setSelectedProduct(data);
                        }
                    }}
                />


            </ScrollView>

            <ExceptionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);

                }}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />


            <ExceptionModal
                visible={modalVisibleTwo}
                onClose={() => {
                    setModalVisibleTwo(false);
                    if (showNotEntry) {
                        seendViewDetails(false);
                    }
                }}
                title={modalTitleTwo}
                message={modalMessageTwo}
                buttonLabel={modalButtonLabelTwo}
            />

            <ExecptionModalCancel
                visible={modalVisibleCancel}
                onClose={() => setModalVisibleCancel(false)}
                onAccept={async () => {
                    await handleRejectOrder();
                    setModalVisibleCancel(false);
                }}
                title={modalTitleCancel}
                message={modalMessageCancel}
                acceptButtonLabel="Aceptar"
                cancelButtonLabel="Cancelar"
            />

            <ExcetptionModalProducts
                visible={modalVisibleValidate}
                onClose={() => setModalVisibleValidate(false)}
                title={modalTitleValidate}
                subTitle={modalMessageValidate}
                buttonLabel={modalButtonLabelValidate}
                onAccept={() => {
                    setModalVisibleValidate(false);
                    setUploadPhotoNoDelivery(true);
                }}
                onReject={() => {
                    setModalVisibleValidate(false);
                    handleSubmitReject();
                }}
            />

            <ChangeCodeModal
                visible={showChangeCode}
                onClose={() => {
                    setShowChangeCode(false);
                }}
                onConfirm={(newPhone) => {
                    handleSubmitCode(String(newPhone));

                }}
                onAlert={() => {
                    console.log("llego aca");
                }}
                errorMessage={modalMessageAlert}
                hasCargue={showModalPone}
            />


            {uploadPhotoNoDelivery && (
                <UploadPhoto
                    title="Cargar evidencia"
                    subTitle="Debes tomar una foto de la guia de transporte firmada."
                    onClose={() => setUploadPhotoNoDelivery(false)}
                    width={width}
                    onEvidenceComplete={async (evidences) => {
                        const files = evidences
                            .map(e => e.base64)
                            .filter((b64): b64 is string => typeof b64 === "string");
                        setNoDeliveryFiles(files);
                        setUploadPhotoNoDelivery(false);
                        setConfirmNoDelivery(true);
                        await uploadPhotoSubmit(files);
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
                    maxEvidences={1}
                />
            )}

            {modalStatusNovelty == 'right' && (
                <ReportNoveltyScreen
                    title="Reportar novedad"
                    onClose={() => {
                        setStatusNovelty(null);
                    }}
                    width={width}
                    onPress={(data) => {
                        setDataNovelty(data);
                        setRefreshingOnPress(false);
                        setNovelty(true);
                        setAlertButton(true);
                    }}
                    showViewModal={showViewModal}
                    showTypeDetails={showTypeDetails}
                />
            )}

            {showError && (
                <TopErrorAlert
                    visible={showError}
                    message={showErrorMessages}
                    subtitle={showErrorTitle}
                    onHide={() => setsError(false)}
                    duration={6000}
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
        backgroundColor: '#fafaf9',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 45,
        paddingBottom: 20,
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
    },
    headerTitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 18,
        color: '#000',
    },
    placeholder: {
        width: 40,
    },
    card: {
        width: 360,
        height: 113,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 16,
        paddingBottom: 16,
    },
    orderInfo: {
        gap: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelTwo: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 16,
        color: '#141D32',
    },
    footer: {
        position: 'absolute',
        bottom: 45,
        width: '100%',
        alignItems: 'center',
        gap: 12
    },
    storeText: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subTitle: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        color: '#141D32',
        textAlign: 'center',
        marginTop: 4,
    },
    secondCard: {
        width: 360,
        maxHeight: 600,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        gap: 15,
        marginTop: 10,
    },
    gap: {
        gap: 8,
    },
    secondCardTwo: {
        width: width,
        maxHeight: 580,
        borderColor: 'transparent',
        padding: 10,
        gap: 15,
        marginTop: 2,
    },
    orderTitle: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 14,
        color: '#141D32',
    },
    orderCard: {
        width: 328,
        borderRadius: 8,
        padding: 16,
        gap: 10,
        marginBottom: 12,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productCount: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 14,
        color: '#141D32',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        flex: 1,
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#788095',
        marginRight: 10,
    },
    units: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#6B7280',
    },

    backIcon: {
        width: 9,
        height: 16,
        tintColor: '#141D32',
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    rejectButton: {
        width: 304,
        height: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C62828',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 6,
    },
    rejectButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#C62828',

    },
    errorDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#C62828',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

