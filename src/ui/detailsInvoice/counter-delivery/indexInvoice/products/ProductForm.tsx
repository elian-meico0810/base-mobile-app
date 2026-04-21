import { ActionAllData } from '@/components/generals/ActionAllData';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { RedeliveryQuestionModal } from '@/components/generals/RedeliveryQuestionModa';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { ThemedView } from '@/components/themed-view';
import { CausalRefusedEnum, TyepeCausalRefusedEnum, TypeCaculateValueEnum, TypeDetailsEnum, TypeEntry } from '@/src/constants/GuideStates';
import { ProductValidationSection } from '@/src/features/detailsInvoice/components/ProductValidationScreen';
import { ReportMassiveRejectScreen } from '@/src/features/detailsInvoice/components/ReportMassiveRejectScreen';
import { ReportNoveltyScreen } from '@/src/features/detailsInvoice/components/ReportNoveltyScreen';
import { causalValuePorps, Cause, Detail, Document, GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { calculateVlueByPorducts, capitalizeFirst, cleanSpaces } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface ProductFormFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    IsGoBack?: boolean;
    routeStartedBotton?: string;
    isViewDetailsPorducts?: boolean;
    isAnticipe?: string;
    notDetails?: string;
    notEntry?: string;

}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

// Interface para los datos de razón
interface ReasonData {
    type: string;
    units: number;
    description?: string;
    codigo?: string;
}

interface FinalizedData {
    validatedCount: number;
    pendingCount: number;
    totalValue: number;
    totalValueSuccess: number;
    totalValueWarning: number;
    validatedProducts: any;
    statistics: {
        successCount: number;
        warningCount: number;
    };
}
export function ProductForm({
    initialGuide,
    token = "",
    onSubmit,
    numberGuide,
    isSelectInvocies,
    documentMeico,
    isCountryDelivery = false,
    IsGoBack = false,
    routeStartedBotton,
    isViewDetailsPorducts,
    isAnticipe,
    notDetails,
    notEntry
 }: ProductFormFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [dataNovelty, setDataNovelty] = useState<ReasonData[]>([]);
    const [successButton, setSuccessButton] = useState(false);
    const [alertButton, setAlertButton] = useState(false);
    const [uploadPhotoFile, setUploadPhotoFile] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setViewModal] = useState(false);
    const [showViewModalActionRefused, setViewModalActionRefused] = useState(false);
    const [showViewModalActionSuccess, setViewModalActionSuccess] = useState(false);
    const [modalStatusNovelty, setStatusNovelty] = useState<'left' | 'right' | null>(null);
    const [refreshing, setRefreshingOnPress] = useState(false);
    const [finalizedData, setFinalizedData] = useState<FinalizedData | null>(null);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [showNovelty, setNovelty] = useState(false);
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [isExpanded, setIsExpanded] = useState(true);
    const [showPorductData, setPorductData] = useState<Document[]>([]);
    const [productItemData, setProductItemData] = useState<Detail | null>(null);
    const [productItemDataPending, setProductItemDataPending] = useState<Detail[]>([]);
    const [showTypeDetails, setTypeDetails] = useState<Cause[]>([]);
    const [shoyStatusAlert, setStatusAlert] = useState(false);
    const [showMassiveReject, setShowMassiveReject] = useState(false);
    const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
    const [selectedOption, setSelectedOption] = useState<TypeEntry.ENTREGA_OTRO_DIA | TypeEntry.NO_ENTREGADO | null>(null);

    const router = useRouter();
    const orderId = initialGuide?.pedidos?.[0]?.id;

    const handleGoBack = () => {
        router.push(
            `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${isSelectInvocies}&notEntry=${notEntry}`
        );
    };

    // Funciones para expandir/recoger
    const handleExpand = () => setIsExpanded(true);
    const handleCollapse = () => setIsExpanded(false);

    const handleSubmit = async () => {
        try {
            console.log("entor aca: ");
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (showViewModal || modalStatusNovelty == 'right') {
            setNovelty(false)
        }

    }, [showViewModal, modalStatusNovelty]);

    useEffect(() => {
        const processPhotos = async () => {
            await handleSubmitData();
        }

        processPhotos();

    }, [uploadPhotoFile]);

    const handleSubmitData = async () => {
        try {
            setLoading(true);
            if (uploadPhotoFile && multiplePhotos) {
                const validBase64 = multiplePhotos
                    .filter(photo => photo.base64 && photo.base64.trim() !== '')
                    .map(photo => photo.base64!);

                if (validBase64.length === 0) {
                    setUploadPhotoFile(false);
                    setModalTitle("Alerta");
                    setModalMessage(`Ninguna foto tiene datos base64 válidos`);
                    setModalVisible(true);
                    return;
                }

                const payload = {
                    id_pedido: Number(orderId),
                    files: validBase64
                };
                const response = await detailsRepositoryImpl.reportNoveltyFileArray(payload, token);
                if (response) {
                    setUploadPhotoFile(false);
                    setModalTitle("¡Procesado!");
                    setModalMessage(`Soporte(s) procesados exitosamente.`);
                    setModalVisible(true);
                    if (isSelectInvocies) {
                        console.log("llego aca al if ", notDetails);
                        
                        router.push(
                            `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&detailsCounterDelivery=${true}&isViewDetailsPorducts=${'true'}&isAnticipe=${isAnticipe}&notDetails=${notDetails}&isSelectInvocies=${isSelectInvocies}`
                        );
                    } else {
                        console.log("llego aca al else ");
                        router.push(
                            `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&detailsCounterDelivery=${true}&notDetails=${notDetails}&selectedOption=${selectedOption}&isSelectInvocies=${isSelectInvocies}`
                        );
                    }

                } else {
                    setModalTitle("Alerta");
                    setModalMessage(response?.message || "Error inesperado.");
                    setModalVisible(true);
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
        if (successButton || alertButton) {
            submitDataByActionsAlert();
        }
    }, [successButton, alertButton]);

    const conticion = notDetails == 'true';

    const submitDataByActionsAlert = async () => {
        try {
            if (modalVisible) return;

            const detalles = productItemDataPending;
            setLoading(true);

            if (successButton) {
                const payload = detalles.map((productItemData: any) => ({
                    idPedidoDetalle: productItemData.id, // opcional
                    totalEntregado: conticion ? '0' : String(
                        Number(productItemData.unidadesSolicitadas) *
                        Number(productItemData.valorBaseProducto)
                    ),
                    totalImpuestoEntrega: conticion ? '0' : String(
                        Number(productItemData.totalImpuestos)
                    ),
                }));

                const response = await detailsRepositoryImpl.sendOrderArray(
                    payload
                    , token);

                if (response?.statusCode != 200) {
                    setModalTitle("¡Alerta!");
                    setModalMessage(response.message || "Ocurrio un error al actualizar el producto.");
                    setModalVisible(true);
                }
            } else if (alertButton) {
                const payload = detalles.map((pedido: any) => ({
                    pedidoDetalleId: Number(pedido.id),
                    totalEntregado: 0,
                    totalImpuestoEntrega: 0,
                    unidadesEntregadas: 0,
                    unidadesRechazadas: Number(pedido.unidadesSolicitadas),
                    novedades: [
                        {
                            causalCodigo: selectedCause?.codigo || "",
                            valor: String(pedido.unidadesSolicitadas),
                        }
                    ],
                }));

                const response = await detailsRepositoryImpl.noveltyOrder(
                    payload
                    , token);

                if (response?.statusCode != 200) {
                    setModalTitle("¡Alerta!");
                    setModalMessage(response.message || "Ocurrio un error al actualizar el producto.");
                    setModalVisible(true);
                }
            }
            getDataProduct();
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    const validateStatus =
        !!showPorductData?.[0]?.detalles?.length &&
        showPorductData[0].detalles.every(
            item => item.estado?.codigo === 'EST_DET_VALIDADO'
        );

    const hasItemsValidateSuccess = productItemDataPending.some(
        item => item.estado?.codigo === 'EST_DET_VALIDADO'
    );

    const handleValidate = (data?: ReasonData[], id?: number): boolean => {
        try {
            if (data && data.length > 0) {
                // Buscar el producto en todos los documentos
                let product: Detail | undefined;
                for (const doc of showPorductData) {
                    const found = doc.detalles.find(p => p.id === id);
                    if (found) {
                        product = found;
                        break;
                    }
                }

                const totalUnits = data.reduce((sum, item) => sum + item.units, 0);

                if (product && Number(totalUnits) > Number(product.unidadesSolicitadas)) {
                    setModalTitle("¡Alerta!");
                    setModalMessage("La cantidad reportada no puede ser mayor a la despachada.");
                    setModalVisible(true);
                    return false;
                } else if (product && Number(totalUnits) == 0) {
                    setModalTitle("¡Alerta!");
                    setModalMessage("La cantidad reportada no puede ser 0");
                    setModalVisible(true);
                    return false;
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    };


    const submitDataByActions = async (data?: ReasonData[]) => {
        try {

            if (!productItemData) {
                setModalTitle("¡Alerta!");
                setModalMessage("Información del producto no disponible.");
                setModalVisible(true);
                return;
            }
            setLoading(true);
            let novedadesArray = [];
            const isValid = handleValidate(data, productItemData?.id);
            if (!isValid) {
                return;
            }

            if (modalStatusNovelty == "left" && productItemData?.id
            ) {

                const response = await detailsRepositoryImpl.sendOrder(
                    {
                        totalEntregado: conticion ? '0 ' : String(Number(productItemData.unidadesSolicitadas) * Number(productItemData.valorBaseProducto)),
                        totalImpuestoEntrega: conticion ? '0 ' : String(productItemData?.totalImpuestos),
                    }
                    , String(productItemData?.id), token);

                if (response?.statusCode != 200) {
                    setModalTitle("¡Alerta!");
                    setModalMessage(response.message || "Ocurrio un error al actualizar el producto.");
                    setModalVisible(true);
                }

            } else {
                if (modalStatusNovelty == "right" &&
                    productItemData?.id
                ) {
                    let totalUnits = 0;
                    // Array para acumular todas las nove   dades
                    if (data && data.length > 0) {
                        for (const novelty of data) {

                            // Solo agregar si tiene unidades
                            if (novelty.units != 0 && novelty.units >= 0 && Number(productItemData?.unidadesSolicitadas) - Number(novelty.units) >= 0) {
                                let novelty_value = "";
                                totalUnits += Number(novelty.units);
                                switch (novelty.type) {
                                    case TyepeCausalRefusedEnum.DINERO_INSUFICIENTE:
                                        novelty_value = CausalRefusedEnum.CS_NOV_DIN_INSUF;
                                        break;

                                    case TyepeCausalRefusedEnum.PRODUCTOS_DANADOS:
                                        novelty_value = CausalRefusedEnum.CS_NOV_PROD_DAÑADO;
                                        break;

                                    case TyepeCausalRefusedEnum.PRODUCTOS_VENCIDOS:
                                        novelty_value = CausalRefusedEnum.CS_NOV_PROD_VENC;
                                        break;

                                    default:
                                        novelty_value = novelty.codigo || CausalRefusedEnum.CS_NOV_OTRO;


                                }

                                const noveltyData: causalValuePorps = {
                                    causalCodigo: novelty_value,
                                    valor: novelty.units.toString(),
                                };

                                novedadesArray.push(noveltyData);
                            }
                        }

                        const payload = {
                            pedidoDetalleId: Number(productItemData?.id),
                            unidadesRechazadas: Number(totalUnits),
                            unidadesEntregadas: Number(productItemData?.unidadesSolicitadas) - Number(totalUnits),
                            totalEntregado: conticion ? 0 : calculateVlueByPorducts(productItemData, TypeCaculateValueEnum.ACTION_5, totalUnits),
                            totalImpuestoEntrega: conticion ? 0 : calculateVlueByPorducts(productItemData, TypeCaculateValueEnum.ACTION_7, totalUnits),
                            novedades: novedadesArray
                        };

                        // Verificar si hay novedades para enviar
                        const response = await detailsRepositoryImpl.noveltyOrder(
                            [payload]
                            , token);

                        novedadesArray = [];

                        if (response?.statusCode != 200) {
                            setModalTitle("¡Alerta!");
                            setModalMessage(response.message || "Ocurrio un error al actualizar el producto.");
                            setModalVisible(true);
                            return;
                        }
                    }
                }
            }
            getDataProduct();
            novedadesArray = [];

            setProductItemData(null);
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const getRefused = async () => {
        try {
            const responseQuery = await detailsRepositoryImpl.listTypeDetails(TypeDetailsEnum.CAUS_REP_NOVEDAD, token);

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

    const getDataProduct = async () => {
        try {
            setLoading(true);
            const responseQuery = await detailsRepositoryImpl.listPorductData(token, Number(orderId));
            if (responseQuery?.statusCode == 200) {
                if (typeof responseQuery.data === "object" && !Array.isArray(responseQuery.data)) {
                    setPorductData(responseQuery.data ? [responseQuery.data] : []);

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

    useEffect(() => {
        if (token) {
            const checkDateToken = async () => {
                const dateToken = await SecureStore.getItemAsync('date_token');

                if (dateToken) {
                    // Parsear la fecha guardada
                    const parts = dateToken.split(/[- :]/);
                    const savedDate = new Date(
                        parseInt(parts[0]),
                        parseInt(parts[1]) - 1,
                        parseInt(parts[2]),
                        parseInt(parts[3]),
                        parseInt(parts[4]),
                        parseInt(parts[5])
                    );

                    // Crear fecha actual
                    const now = new Date();

                    // Crear fecha de medianoche del día de la fecha guardada
                    const midnightOfSavedDay = new Date(savedDate);
                    midnightOfSavedDay.setHours(23, 59, 59, 999); // Exactamente antes de medianoche

                    // Verificar si AHORA es después de medianoche del día guardado
                    // if (now > midnightOfSavedDay) {
                    tokenData();
                    // }
                } else {
                    tokenData();
                }
            };
            checkDateToken();

        }
    }, [token]);


    useEffect(() => {
        getDataProduct();
        getRefused();
    }, []);


    useEffect(() => {
        if (modalStatusNovelty == "left" && productItemData?.id) {
            submitDataByActions();
        }
    }, [modalStatusNovelty, productItemData?.id, successButton]);

    const tokenData = async () => {
        try {

            const responseData = await detailsRepositoryImpl.tokenPorducts(token);
            if (responseData?.statusCode == 200 && responseData?.data &&
                !Array.isArray(responseData.data) &&
                typeof responseData.data !== "string") {

                await SecureStore.setItemAsync('service_token_product', responseData.data.token);
                await SecureStore.setItemAsync('base_url_product', responseData.data.base_url);
                const inicializateToken = new Date();
                const formatted = inicializateToken.toLocaleString('sv-SE').replace('T', ' ');

                // Opción 1: Guardar como timestamp (recomendado)
                await SecureStore.setItemAsync('date_token_product', formatted);

                const testToken = await SecureStore.getItemAsync('service_token_product');
                const testUrl = await SecureStore.getItemAsync('base_url_product');
                const dateToken = await SecureStore.getItemAsync('date_token_product');

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
        const dataProduct = async () => {
            await getDataProduct();
        }

        dataProduct();

    }, [token]);

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
            <Pressable
                onPress={isExpanded ? handleCollapse : handleExpand}
                disabled={validateStatus}
            >
                {/* Card blanco centrado */}
                <View
                    style={[
                        styles.card,
                        !isExpanded && styles.cardCollapsed
                    ]}
                >
                    <View style={styles.headerRow}>

                        <View style={styles.namesContainer}>
                            <Text style={styles.merchantName}>
                                {capitalizeFirst(guide?.nombreCliente) ?? ''}
                            </Text>

                            <Text style={styles.merchantSubName}>
                                {capitalizeFirst(guide?.razonSocial) ?? ''}
                            </Text>
                        </View>

                        <View style={styles.expandButton}>
                            <View style={styles.arrowsContainer}>
                                <Image
                                    source={require('@/assets/icons/ReboackPage.png')}
                                    style={styles.reboackIcon}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                    </View>

                    {/* Contenido expandido */}
                    {(isExpanded && !validateStatus) && (
                        <View style={styles.expandedContent}>
                            <Text style={styles.address}>
                                {cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}
                            </Text>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => setViewModalActionRefused(true)}
                                >
                                    <MaterialIcons name="close" size={16} color="#C62828" />
                                    <Text style={styles.rejectButtonText}> Rechazo masivo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => setViewModalActionSuccess(true)}
                                >
                                    <MaterialIcons name="check" size={16} color="#1F9144" />
                                    <Text style={styles.acceptButtonText}> Validacion masiva</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Pressable>


            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                {/** Listado de productos */}
                <ProductValidationSection
                    onFinalize={() => {
                        if (!notDetails) {
                            handleSubmit;
                            setUploadPhoto(true);
                        }
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
                    dataPorduct={showPorductData}
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
                    notDetails={notDetails}
                    onValueInvocie={(value) => {
                        if (notDetails) {
                            if (value == 0) {
                                setShowModal(true);
                            } else {
                                handleSubmit;
                                setUploadPhoto(true);
                            }
                        }
                    }}
                />
            </ScrollView>

            {(uploadPhoto) && (
                <UploadPhoto
                    title="Cargar evidencia"
                    subTitle="Toma fotos de la mercancía ubicada en el cliente. Podrás asociar un máximo de 3 imágenes por entrega."
                    onClose={() => {
                        setUploadPhoto(false);
                        // setAlertButton(false);
                        // setSuccessButton(false);
                    }}
                    width={width}

                    onEvidenceComplete={(evidences) => {
                        setUploadPhoto(false);
                        setMultiplePhotos(evidences);
                        setUploadPhotoFile(true);
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

            {(showModal) && (
                <RedeliveryQuestionModal
                    onClose={() => setShowModal(false)}
                    onConfirm={(response) => {
                        if (response) {
                            setSelectedOption(response);
                            setUploadPhoto(true);
                        }
                    }}
                />
            )}


            {modalStatusNovelty == 'right' && (
                <ReportNoveltyScreen
                    title="Reportar novedad"
                    onClose={() => {
                        setStatusNovelty(null);
                        setRefreshingOnPress(true);
                    }}
                    width={width}
                    onPress={(data) => {
                        setDataNovelty(data);
                        submitDataByActions(data);
                        setRefreshingOnPress(false);
                        setNovelty(true);
                        setTimeout(() => {
                            setStatusNovelty(null);
                        }, 100);
                    }}
                    showViewModal={showViewModal}
                    showTypeDetails={showTypeDetails}
                />
            )}

            {showViewModalActionRefused && (
                <ActionAllData
                    title="¿Estás seguro de que deseas rechazar todos los productos?"
                    onClose={() => {
                        setViewModalActionRefused(false);
                        // setAlertButton(false);
                        // setSuccessButton(false);
                    }}
                    width={width}
                    onConfirmation={() => {
                        setViewModalActionRefused(false);
                        setShowMassiveReject(true);
                    }}
                />
            )}

            {showMassiveReject && (
                <ReportMassiveRejectScreen
                    title="Motivo del rechazo"
                    showTypeDetails={showTypeDetails}
                    onClose={() => setShowMassiveReject(false)}
                    onPress={(cause) => {
                        setSelectedCause(cause);
                        setAlertButton(true);
                    }}
                />
            )}

            {showViewModalActionSuccess && (
                <ActionAllData
                    title="¿Estás seguro de que deseas aceptar todos los productos?"
                    onClose={() => {
                        setViewModalActionSuccess(false);
                        // setAlertButton(false);
                        // setSuccessButton(false);
                    }}
                    width={width}
                    onConfirmation={() => {
                        setAlertButton(false);
                        setSuccessButton(true);
                        setViewModalActionSuccess(false);
                    }}
                />
            )}
            {loading && <LoadingBlue />}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    expandButtonDisabled: {
        opacity: 0.4,
    },
    container: {
        flex: 1,
        width: width,
        height: height,
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
    headerTSubitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 18,
        color: '#000',
        textAlign: 'left',
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
        alignSelf: 'center',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 12,
        shadowColor: "#000",
        marginTop: 1,
        minHeight: 49,
    },
    cardCollapsed: {
        height: 60,
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 8,
    },
    expandButton: {
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#D1D3D8',
    },
    expandButtonText: {
        fontSize: 16,
        color: '#141D32',
        fontWeight: 'bold',
    },
    expandedContent: {
        gap: 8,
    },
    address: {
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    rejectButton: {
        width: 160,
        height: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C62828',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    rejectButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#C62828',
    },
    acceptButton: {
        width: 160,
        height: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1F9144',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    acceptButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F9144',
    },
    arrowsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
    },
    subtitleContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 10,
        alignItems: 'flex-start',
    },
    reboackIcon: {
        width: 12,
        height: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },

    namesContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#141D32',
        textAlign: 'center',
    },
    merchantSubName: {
        fontSize: 13,
        fontWeight: '400',
        color: '#788095',
        textAlign: 'center',
        marginTop: 2,
    },
});