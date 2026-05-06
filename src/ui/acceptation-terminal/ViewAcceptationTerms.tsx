import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButtonCancel } from '@/components/buttons/SecondaryButtonCancel';
import { ExcetptionModalProducts } from '@/components/generals/ExcetptionModalProducts';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { UploadPhoto } from '@/components/photo/uploadPhoto';
import { GuideDetailSkeleton } from '@/components/skeleton/GuideDetailSkeleton';
import { ThemedView } from '@/components/themed-view';
import { CustomerAddress, GuideResponse, Order } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';

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
}

export function ViewAcceptationTerms({ token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, isCountryDelivery = false, IsGoBack = false, routeStartedBotton, detailsCounterDelivery }: InfoInvoiceFormProps) {
    const [guide, setGuide] = useState<GuideResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sasToken, setSasToken] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [allowBack, setAllowBack] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [ejecuteData, setEjecuteData] = useState(false);
    const [showSuccessQRp, setShowSuccessQRP] = useState(false);
    const [modalVisibleValidate, setModalVisibleValidate,] = useState(false);
    const [modalTitleValidate, setModalTitleValidate] = useState("");
    const [modalMessageValidate, setModalMessageValidate] = useState("");
    const [modalButtonLabelValidate, setModalButtonLabelValidate] = useState("Entendido");
    const [showErrorQRP, setShowErrorQRP] = useState(false);
    const [showErrorQRPMessage, setShowErrorQRPMessage] = useState("Código OTP incorrecto");
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

    const listTotalsGuide = async () => {
        try {
            const respones = await invoiceRepositoryImpl.listTotalsGuide(String(numberGuide), token);
            if (respones?.statusCode === 200 && respones.data) {

                setEjecuteData(true);
                setGuide(respones.data as GuideResponse);
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

    const handleAceptataionOrder = async (pedido?: Order) => {
        try {
            setLoading(true);
            
            const response = await invoiceRepositoryImpl.aceptationOrder(
                {
                    codigo: String(pedido?.codigo),
                    bodega: String(pedido?.bodega),
                    canal: String(pedido?.canal),
                    codigo_cliente: String(pedido?.codigo_cliente),
                    codigo_guia: String(numberGuide),

                    producto: pedido?.detalles?.map((item) => ({
                        linea: item.linea,

                        CodigoProducto: item.producto?.codigo
                            ? String(item.producto.codigo)
                            : '',

                        DescripcionProducto: item.producto?.nombre ?? null,
                        EAN: null,

                        unidades_solicitadas: item.unidadesSolicitadas ?? 0,
                        unidades_rechazadas: 0,
                    })) ?? []
                }, token);

            if (response?.statusCode === 200) {
                setModalTitle("¡Procesado!");
                setModalMessage(`Pedido procesados exitosamente.`);
                setModalVisible(true);
                return;
            } else {
                setModalTitle("¡Alerta!");
                setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
                setModalVisible(true);
                return;
            }
        } catch (error) {
            setModalTitle("¡Error!");
            setModalMessage("Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const pedidosFlat = guide?.details?.flatMap(d => d.pedidos) || [];
    
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

            {!guide ? (
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
                                    {
                                        guide?.details?.reduce((total, address) => {
                                            return total + (address.pedidos?.length ?? 0);
                                        }, 0) ?? 0
                                    } Pedidos
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.secondCardTwo}>
                        <ScrollView>
                            {pedidosFlat.map((pedido, index) => (
                                <View key={`${pedido.codigo + index}`} style={styles.secondCard}>

                                    <View style={styles.orderHeader}>
                                        <Text style={styles.orderTitle}>
                                            Pedido {pedido.codigo || ""}
                                        </Text>

                                        <Text style={styles.productCount}>
                                            {pedido.detalles?.length || 0} productos
                                        </Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.gap}>
                                        {pedido.detalles?.map((item, itemIndex) => (
                                            <View
                                                key={`${item.producto?.codigo + itemIndex}`}
                                                style={styles.productRow}
                                            >
                                                <Text numberOfLines={1} style={styles.productName}>
                                                    {item.producto?.nombre
                                                        ? item.producto.nombre.charAt(0).toUpperCase() +
                                                        item.producto.nombre.slice(1).toLowerCase()
                                                        : ""}
                                                </Text>

                                                <Text style={styles.units}>
                                                    {item.unidadesSolicitadas || 0} uds.
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* BOTONES POR CARD */}
                                    <View style={styles.buttonsRow}>
                                        <SecondaryButtonCancel
                                            title="Reporatar Novedad"
                                            onPress={() => console.log('Rechazar pedido', pedido)}
                                            disabled={false}
                                            width={160}
                                            height={40}
                                            fontSize={14}
                                        />

                                        <PrimaryButton
                                            title="Aceptar pedido"
                                            onPress={async () => {
                                                await handleAceptataionOrder(pedido)
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

            {guide && (

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
});

