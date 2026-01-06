import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { UploadPhoto } from '@/components/photo/UploadPhoto';
import { ThemedView } from '@/components/themed-view';
import { CausalRefusedEnum, TyepeCausalRefusedEnum, TypeCaculateValueEnum } from '@/src/constants/GuideStates';
import { ProductValidationSection } from '@/src/features/detailsInvoice/components/ProductValidationScreen';
import { ReportNoveltyScreen } from '@/src/features/detailsInvoice/components/ReportNoveltyScreen';
import { Detail, Document, GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { calculateVlueByPorducts, capitalizeFirst, cleanSpaces } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
export function ProductForm({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, isCountryDelivery = false, IsGoBack = false, routeStartedBotton }: ProductFormFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [dataNovlety, setDataNovlety] = useState<ReasonData[]>([]);
    const [successButton, setSuccessButton] = useState(false);
    const [alertButton, setAlertButton] = useState(false);
    const [uploadPhotoFile, setUploadPhotoFile] = useState(false);
    const [showViewModal, setViewModal] = useState(false);

    const [modalStatusNovelty, setStatusNovelty] = useState<'left' | 'right' | null>(null);
    const [refreshing, setRefreshingOnPress] = useState(false);
    const [finalizedData, setFinalizedData] = useState<FinalizedData | null>(null);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [showNovelty, setNovelty] = useState(false);
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPorductData, setPorductData] = useState<Document[]>([]);
    const [productItemData, setProductItemData] = useState<Detail | null>(null);

    const router = useRouter();
    const orderId = initialGuide?.pedidos?.[0]?.id;

    console.log("refreshing: ",refreshing);
    
    const handleGoBack = () => {
        if (routeStarted && isCountryDelivery) {
            router.push(
                `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
            );
        } else {
            router.back();
        }
    };

    // Funciones para expandir/recoger
    const handleExpand = () => setIsExpanded(true);
    const handleCollapse = () => setIsExpanded(false);

    const handleSubmit = async (data: FinalizedData) => {
        try {
            console.log("entor aca: ", data);
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dataNovlety.length > 0) {
            submitDataByActions();
            // Aquí puedes hacer lo que necesites con los datos actualizados
            // Por ejemplo, hacer una llamada API, actualizar UI, etc.

            // Cerrar el modal después de procesar los datos
            setStatusNovelty(null);
        }
    }, [dataNovlety]); // Se ejecuta cada vez que dataNovlety cambia


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
            if (uploadPhotoFile) {
                // const facturasArray: CreateEntregaProps[] = [];
                // let responses: any[] = [];
                // if (guide?.facturas && guide.facturas.length > 0) {
                //     guide.facturas.forEach((factura, index) => {
                //         facturasArray.push({
                //             ruta: String(numberGuide),
                //             documentMeico: String(factura.numeroFactura),
                //             direccion: Number(guide?.idDireccion),
                //             causal: null,
                //             estado: "ACT_EST_ENTREGA",
                //             files: multiplePhotos.map((item) => ({
                //                 tipoEntrega: TypeDelivery.RECHAZADO,
                //                 rutaArchivo: item.base64 ?? null,
                //             }))


                //         });
                //     });
                // }

                // if (facturasArray.length > 0) {
                //     responses = await Promise.all(
                //         facturasArray.map(facturaData =>
                //             invoiceRepositoryImpl.createDelivery(facturaData, token)
                //         )
                //     );

                //     // Verificar si todas las respuestas fueron exitosas
                //     const success = responses.every((resp: any) =>
                //         resp?.statusCode === 200 || resp?.success === true
                //     );
                //     if (success) {
                //         setLoading(false);
                //         setUploadPhotoFile(false);
                //         setModalTitle("¡Procesado!");
                //         setModalMessage(`Soporte(s) procesados exitosamente.`);
                //         setModalVisible(true);
                //     } else {
                //         setLoading(false);
                //         // Opcional: mostrar detalles del primer error
                //         const oneError = responses.find((resp: any) =>
                //             !(resp?.statusCode === 200 || resp?.success === true)
                //         );
                //         setModalTitle("Alerta");
                //         setModalMessage(oneError?.message || "Error inesperado.");
                //         setModalVisible(true);
                //     }
                // }
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
        if (modalStatusNovelty && productItemData) {
            submitDataByActions();
        }
    }, [modalStatusNovelty, productItemData]);


    const submitDataByActions = async () => {
        try {
            setLoading(true);
            if (modalStatusNovelty == "left" &&
                productItemData?.id
            ) {
                const response = await detailsRepositoryImpl.sendOrder(
                    {
                        totalEntregado: String(Number(productItemData.unidadesSolicitadas) * Number(productItemData.valorBaseProducto)),
                        totalImpuestoEntrega: String(productItemData?.totalImpuestos),
                    }
                    , String(productItemData?.id), token);

                if (response?.statusCode != 200) {
                    setModalTitle("¡Alerta!");
                    setModalMessage(response.message || "Ocurrio un error al actualizar el producto.");
                    setModalVisible(true);
                }

            } else if (modalStatusNovelty == "right" &&
                productItemData?.id
            ) {
                // Array para acumular todas las novedades
                let novedadesArray = [];

                for (const novelty of dataNovlety) {

                    // Solo agregar si tiene unidades
                    if (novelty.units > 0 && Number(productItemData?.unidadesSolicitadas) - Number(novelty.units) > 0) {
                        let novelty_value = "";

                        switch (novelty.type) {
                            case TyepeCausalRefusedEnum.DINERO_INSUFICIENTE:
                                novelty_value = CausalRefusedEnum.CS_NOV_DIN_INSUF

                            case TyepeCausalRefusedEnum.PRODUCTOS_DANADOS:
                                novelty_value = CausalRefusedEnum.CS_NOV_PROD_DAÑADO

                            case TyepeCausalRefusedEnum.PRODUCTOS_VENCIDOS:
                                novelty_value = CausalRefusedEnum.CS_NOV_PROD_VENC

                            default:
                                novelty_value = CausalRefusedEnum.CS_NOV_OTRO

                        }
                        // console.log("productItemData?.unidadesSolicitadas: ", productItemData?.unidadesSolicitadas);
                        // console.log("novelty?.units: ", novelty?.units);
                        // console.log("Resta: ", Number(productItemData?.unidadesSolicitadas) - Number(novelty.units));

                        const noveltyData = {
                            pedidoDetalleId: Number(productItemData?.id),
                            causalCodigo: novelty_value,
                            valor: novelty.units.toString(),
                            unidadesRechazadas: Number(productItemData?.unidadesSolicitadas) - Number(novelty.units),
                            unidadesEntregadas: calculateVlueByPorducts(productItemData, TypeCaculateValueEnum.ACTION_6, novelty.units),
                            totalEntregado: calculateVlueByPorducts(productItemData, TypeCaculateValueEnum.ACTION_5, novelty.units),
                            totalImpuestoEntrega: calculateVlueByPorducts(productItemData, TypeCaculateValueEnum.ACTION_7, novelty.units),
                        };

                        novedadesArray.push(noveltyData);
                    }
                }


                // Verificar si hay novedades para enviar
                if (novedadesArray.length > 0) {

                    const response = await detailsRepositoryImpl.noveltyOrder(
                        novedadesArray
                        , token);

                    novedadesArray = [];

                    if (response?.statusCode != 200) {
                        setModalTitle("¡Alerta!");
                        setModalMessage(response.message || "Ocurrio un error al actualizar el producto.");
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
        if (Array.isArray(showPorductData) && showPorductData.length > 0) {
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
                    if (now > midnightOfSavedDay) {
                        tokenData();
                    }
                }
            };
            checkDateToken();

        }
    }, [showPorductData]);


    useEffect(() => {
        getDataProduct();
    }, []);


    const tokenData = async () => {
        try {
            const responseData = await detailsRepositoryImpl.tokenPorducts(token);
            if (responseData?.statusCode == 200 && responseData?.data &&
                !Array.isArray(responseData.data) &&
                typeof responseData.data !== "string") {

                await SecureStore.setItemAsync('service_token', responseData.data.token);
                await SecureStore.setItemAsync('base_url', responseData.data.base_url);
                const inicializateToken = new Date();
                const formatted = inicializateToken.toLocaleString('sv-SE').replace('T', ' ');

                // Opción 1: Guardar como timestamp (recomendado)
                await SecureStore.setItemAsync('date_token', formatted);


                const testToken = await SecureStore.getItemAsync('service_token');
                const testUrl = await SecureStore.getItemAsync('base_url');
                const dateToken = await SecureStore.getItemAsync('date_token');


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
            {/* Card blanco centrado */}
            <View style={[
                styles.card,
                !isExpanded && styles.cardCollapsed
            ]}>
                <View style={styles.headerRow}>
                    <Text style={styles.merchantName}>{capitalizeFirst(guide?.nombreCliente) ?? ''}</Text>

                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={isExpanded ? handleCollapse : handleExpand}
                    >
                        <View style={styles.arrowsContainer}>
                            {/* Icono superior */}
                            <Image
                                source={require('@/assets/icons/ReboackPage.png')}
                                style={[
                                    styles.reboackIcon,
                                ]}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Contenido expandido */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.address}>{cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}</Text>

                        {/* Botones de Rechazar todo y Aceptar todo */}
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => {
                                    setSuccessButton(false);
                                    setUploadPhoto(true);
                                    setAlertButton(true);
                                }}
                            >
                                <MaterialIcons name="close" size={16} color="#C62828" />
                                <Text style={styles.rejectButtonText}> Rechazar todo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => {
                                    setAlertButton(false);
                                    setUploadPhoto(true);
                                    setSuccessButton(true);
                                }}
                            >
                                <MaterialIcons name="check" size={16} color="#1F9144" />
                                <Text style={styles.acceptButtonText}> Aceptar todo</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                )}
            </View>

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />

            {/** Listado de productos */}
            <ProductValidationSection
                onFinalize={(data) => {
                    handleSubmit;
                    setUploadPhoto(true);
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
                data={dataNovlety}
                messages={(messages) => {
                    setModalTitle("¡Alerta!");
                    setModalMessage(messages);
                    setModalVisible(true);
                }}
                dataPorduct={showPorductData}
                onItemData={(data) => {
                    setProductItemData(data);
                }}
            />

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

            {modalStatusNovelty == 'right' && (
                <ReportNoveltyScreen
                    title="Reportar novedad"
                    onClose={() => {
                        setStatusNovelty(null); 
                        setRefreshingOnPress(true);
                    }}
                    width={width}
                    onPress={(data) => {
                        setDataNovlety(data);
                        setNovelty(true);
                        setTimeout(() => {
                            setStatusNovelty(null);
                        }, 100);
                    }}
                    showViewModal={showViewModal}

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
        height: 49,
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#141D32',
        flex: 1,
        textAlign: 'center',
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
});