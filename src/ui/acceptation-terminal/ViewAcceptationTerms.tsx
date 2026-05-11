import { TopErrorAlert } from '@/components/alerts/TopErrorAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButtonCancel } from '@/components/buttons/SecondaryButtonCancel';
import { ExcetptionModalProducts } from '@/components/generals/ExcetptionModalProducts';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { GuideDetailSkeleton } from '@/components/skeleton/GuideDetailSkeleton';
import { ThemedView } from '@/components/themed-view';
import { TypeStatusEnum } from '@/src/constants/GuideStates';
import { OrderGroup } from '@/src/features/tracking/domain/details/DetailsGuide';
import { CustomerAddress } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
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
    isEjecute?: string | null
}

export function ViewAcceptationTerms({
    token = "",
    onSubmit,
    numberGuide,
    isSelectInvocies,
    documentMeico,
    isCountryDelivery = false,
    IsGoBack = false,
    routeStartedBotton,
    detailsCounterDelivery,
    isEjecute = null
}: InfoInvoiceFormProps) {
    const [guideOrder, setGuideOrder] = useState<OrderGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sasToken, setSasToken] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [ejecuteData, setEjecuteData] = useState(false);
    const [modalVisibleValidate, setModalVisibleValidate,] = useState(false);
    const [modalTitleValidate, setModalTitleValidate] = useState("");
    const [modalMessageValidate, setModalMessageValidate] = useState("");
    const [modalButtonLabelValidate, setModalButtonLabelValidate] = useState("Entendido");
    const [uploadPhotoNoDelivery, setUploadPhotoNoDelivery] = useState(false);
    const [noDeliveryFiles, setNoDeliveryFiles] = useState<string[]>([]);
    const [confirmNoDelivery, setConfirmNoDelivery] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [showError, setsErrorQRP] = useState(false);
    const [showSuccess, setSuccess] = useState(false);


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

    const listTotalsGuide = async () => {
        try {
            const respones = await invoiceRepositoryImpl.listTotalsGuide(String(numberGuide), token, isEjecute);
            if (respones?.statusCode === 200 && respones.data) {

                setEjecuteData(true);
                setGuideOrder(respones.data as OrderGroup[]);
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
        const init = async () => {
            const token = await SecureStore.getItemAsync("service_token");
            setSasToken(token || "");

        };
        init();

    }, []);


    useEffect(() => {
        if (token) {
            if (ejecuteData) return;
            listTotalsGuide();
        }
    }, [token]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setModalTitleValidate("Aceptación de documento de transporte");
            setModalMessageValidate("Al aceptar este despacho confirmo que recibí de parte de Meico la mercancía descrita en el documento de transporte y asumo la custodia para su traslado y entrega.");
            setModalButtonLabelValidate("Registrar evidencia");
            setModalVisibleValidate(true);


        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

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
        await SecureStore.deleteItemAsync('user_token');
        setTimeout(() => {
            setLoading(false);
            router.replace('/auth/login');
        }, 1200);
    };


    const reportNovelty = (pedido: OrderGroup) => {
        try {

            router.push({
                pathname: '/views/AcceptanceTerms' as any,
                params: {
                    numberGuide: Number(numberGuide),
                    token: String(token),
                    orderDetails: 'true',
                    order: encodeURIComponent(JSON.stringify(pedido))
                }
            });
            setLoading(true);

        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }

    const handleAceptataionOrder = async (pedido?: OrderGroup) => {
        try {
            setLoading(true);
            const response = await invoiceRepositoryImpl.aceptationOrder(
                {
                    codigo: String(pedido?.codigo),
                    bodega: String(pedido?.bodega),
                    canal: String(pedido?.canal),
                    codigo_cliente: String(pedido?.codigo_cliente),
                    codigo_guia: String(numberGuide),

                    producto: pedido?.productos?.map((item) => ({
                        linea: item.linea,

                        CodigoProducto: item.producto?.codigo
                            ? String(item.producto.codigo)
                            : '',

                        DescripcionProducto:
                            item.producto?.nombre ?? null,

                        EAN: item.producto?.ean ?? null,

                        unidades_solicitadas:
                            item.unidades_solicitadas ?? 0,

                        unidades_rechazadas: 0,
                    })) ?? []
                },
                token
            );

            if (response?.statusCode === 200) {
                listTotalsGuide();
                setsErrorQRP(false);
                setSuccess(true);
            } else {
                setSuccess(false);
                setsErrorQRP(true);
            }
        } catch (error) {
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

    // const pedidosFlat = guide?.details?.flatMap(d => d.pedidos) || [];
    let statusIcon = 'success';

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
                    Validación de documento de transporte
                </Text>
            </View>

            {/* Card blanco centrado */}

            {guideOrder?.length == 0 ? (
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
                                    {guideOrder?.length ?? 0} Pedidos
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.secondCardTwo}>
                        <ScrollView>
                            {guideOrder.map((pedido, index) => (
                                <View
                                    key={`${pedido.codigo + index}`}
                                    style={styles.secondCard}
                                >

                                    <View style={styles.orderHeader}>

                                        {/* IZQUIERDA */}
                                        <View style={styles.orderLeft}>
                                            {(pedido?.estado_pedido.codigo === TypeStatusEnum.EST_PEDIDO_ACEPT) ? (
                                                <View style={styles.statusDot}>
                                                    <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                                </View>
                                            ) : (pedido?.estado_pedido.codigo === TypeStatusEnum.EST_PEDI_RECH) ? (
                                                <View style={styles.errorDot}>
                                                    <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                                </View>
                                            ) : (pedido?.estado_pedido.codigo === TypeStatusEnum.EST_PEDI_ENT_PARC) ? (
                                                <View style={styles.warningDot}>
                                                    <MaterialIcons name="warning" size={12} color="#FFA400" />
                                                </View>
                                            ) : null}

                                            <Text style={styles.orderTitle}>
                                                Pedido {pedido.codigo || ""}
                                            </Text>
                                        </View>

                                        {/* DERECHA */}
                                        <Text style={styles.productCount}>
                                            {pedido.productos?.length || 0} productos
                                        </Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.gap}>
                                        {pedido.productos?.map((item, itemIndex) => (
                                            <View
                                                key={`${item.producto?.codigo + itemIndex}`}
                                                style={styles.productRow}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.productName}
                                                >
                                                    {item.producto?.nombre
                                                        ? item.producto.nombre.charAt(0).toUpperCase() +
                                                        item.producto.nombre.slice(1).toLowerCase()
                                                        : ""}
                                                </Text>

                                                <Text style={styles.units}>
                                                    {item.unidades_solicitadas || 0} uds.
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* BOTONES POR CARD */}
                                    <View style={styles.buttonsRow}>
                                        <SecondaryButtonCancel
                                            title="Reporatar Novedad"
                                            onPress={() => {
                                                reportNovelty(pedido);
                                            }}
                                            disabled={false}
                                            width={160}
                                            height={40}
                                            fontSize={14}
                                        />

                                        <PrimaryButton
                                            title="Aceptar pedido"
                                            onPress={async () => {
                                                await handleAceptataionOrder(pedido);
                                            }}
                                            disabled={false}
                                            width={160}
                                            height={40}
                                            fontSize={14}
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                </>
            )}

            {guideOrder?.length > 0 && (

                <View style={[styles.footer, { marginBottom: 10 }]}>
                    <>
                        <PrimaryButton
                            title="Aceptar carga"
                            onPress={handleSubmit}
                            disabled={false}
                            width={328}
                            height={43}
                        />

                        <SecondaryButtonCancel
                            title="Rechazar carga"
                            onPress={handleSubmitReject}
                            disabled={false}
                            width={328}
                            height={43}
                            borderColor={'#C62828'}
                            colorButtonText={'#C62828'}
                        />
                    </>
                </View>
            )}

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
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

            {showSuccess && (
                <TopSuccessAlert
                    visible={showSuccess}
                    message="Pedido confirmado"
                    subtitle={`Las cantidades verificadas coinciden con la factura.`}
                    onHide={() => setSuccess(false)}
                    duration={6000}
                />
            )}

            {showError && (
                <TopErrorAlert
                    visible={showError}
                    message="Problemas al confirmar el pedido"
                    subtitle=" No fue posible confirmar el pedido, intenta de nuevo"
                    onHide={() => setsErrorQRP(false)}
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
        backgroundColor: '#F9F9FA',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 45,
        paddingBottom: 28,
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
        height: 69,
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
        maxHeight: 520,
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
    statusDot: {
        borderRadius: 6.5,
        backgroundColor: '#1F9144',
        borderWidth: 2,
        borderColor: '#1F9144',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },

    warningDot: {
        width: 20,
        height: 20,
        borderRadius: 6.5,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },

    orderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    errorDot: {
        width: 13,
        height: 13,
        borderRadius: 6.5,
        backgroundColor: '#FF3B30',
        borderWidth: 2,
        borderColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
});

