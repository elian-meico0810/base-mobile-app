import { ExcetptionModalProducts } from '@/components/generals/ExcetptionModalProducts';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { ExecptionModalCancel } from '@/components/generals/ExecptionModalCancel';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { GuideDetailSkeleton } from '@/components/skeleton/GuideDetailSkeleton';
import { ThemedView } from '@/components/themed-view';
import { TypeStatusEnum } from '@/src/constants/GuideStates';
import { ProductValidationOrder } from '@/src/features/detailsInvoice/components/ProductValidationOrder';
import { AceptationOrderDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { AceptationPedidoProps, CustomerAddress, Order } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
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
    OrderArray?: Order;

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
    const [modalVisibleCancel, setModalVisibleCancel] = useState(false);
    const [modalTitleCancel, setModalTitleCancel] = useState("");
    const [modalMessageCancel, setModalMessageCancel] = useState("");
    const [isRejected, setIsRejected] = useState(false);
    const [modalButtonLabelCancel, setModalButtonLabelCancel] = useState("Entendido");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [products, setPorductData] = useState<AceptationOrderDetails[]>([]);
    const [modalVisibleValidate, setModalVisibleValidate,] = useState(false);
    const [modalTitleValidate, setModalTitleValidate] = useState("");
    const [modalMessageValidate, setModalMessageValidate] = useState("");
    const [modalButtonLabelValidate, setModalButtonLabelValidate] = useState("Entendido");
    const [uploadPhotoNoDelivery, setUploadPhotoNoDelivery] = useState(false);
    const [noDeliveryFiles, setNoDeliveryFiles] = useState<string[]>([]);
    const [confirmNoDelivery, setConfirmNoDelivery] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
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
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
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
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleExit = async () => {
        setLoading(true);
        router.push({
            pathname: '/views/AcceptanceTerms' as any,
            params: {
                numberGuide: Number(numberGuide),
                token: String(token),
                OrderArray: encodeURIComponent(JSON.stringify(OrderArray))
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


            const responseQuery = await detailsRepositoryImpl.listAceptationOrderDetails(token, Number(numberGuide), String(OrderArray?.codigo));
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


    const handleSubmit = async () => {
        try {
            setLoading(true);
            setModalTitleCancel("¡Alerta!");
            setModalMessageCancel(`¿Confirmas que no recibiste el pedido?`);
            setModalVisibleCancel(true);


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

            const payload: AceptationPedidoProps = {
                bodega: OrderArray?.bodega ?? "",
                canal: OrderArray?.canal ?? "",
                codigo: OrderArray?.codigo ?? "",
                codigo_cliente: OrderArray?.codigo_cliente ?? "",
                codigo_guia: String(numberGuide) ?? "",
                estado: TypeStatusEnum.EST_PEDI_RECH,
                producto: products.map((item) => ({
                    CodigoProducto: item?.producto?.codigo?.trim() ?? "",
                    DescripcionProducto: item?.producto?.nombre ?? "",
                    EAN: item?.producto?.ean ?? null,
                    linea: item?.linea ?? 0,
                    unidades_rechazadas: item?.unidades_solicitadas ?? 0,
                    unidades_solicitadas: item?.unidades_solicitadas ?? 0,
                }))
            };

            const response = await invoiceRepositoryImpl.aceptationOrder(
                payload,
                token
            );

            if (response?.statusCode === 200) {
                setIsRejected(true);
                setModalTitle("¡Procesado!");
                setModalMessage(`Pedido procesado exitosamente.`);
                setModalVisible(true);
                return;
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
                setModalVisible(true);
                return;
            }

        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(
                error?.data?.message ?? "Ocurrió un error inesperado."
            );
            setModalVisible(true);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDataProduct();
    }, [OrderArray, token]);

    return (
        <ThemedView style={styles.container}>
            {/* <NetworkStatus /> */}

            {/* Fondo gris */}
            <View style={styles.background} />

            {/* Header con título */}

            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleExit}>
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
                                    {OrderArray?.detalles?.length ?? 0} Productos
                                </Text>

                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={async () =>
                                        handleSubmit()
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

                    <View style={styles.secondCardTwo}>
                        <ScrollView>

                        </ScrollView>
                    </View>

                </>
            )}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/** Listado de productos */}
                <ProductValidationOrder
                    onFinalize={() => {
                    }}
                    onSuccessAlet={() => {

                    }}
                    dataPorduct={products}
                    token={token}
                    isRejected={isRejected}

                />
            </ScrollView>

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
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

