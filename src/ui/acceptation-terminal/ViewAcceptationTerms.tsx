import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SecondaryButtonCancel } from '@/components/buttons/SecondaryButtonCancel';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { GuideDetailSkeleton } from '@/components/skeleton/GuideDetailSkeleton';
import { ThemedView } from '@/components/themed-view';
import { CustomerAddress, GuideResponse } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';

import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
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

    const btnRef = useRef<any>(null);
    const router = useRouter();

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
                    router.replace('/auth/login');
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

            const response = await invoiceRepositoryImpl.apporveOrReject(
                {
                    guia_id: Number(numberGuide),
                    is_acceptation: true
                }, token);

            if (response?.statusCode === 200) {
                setShowSuccessQRP(true);
                router.push({
                    pathname: '/views/details',
                    params: {
                        guide: Number(numberGuide),
                        token: String(token),
                        showAlert: "true"
                    }
                });
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


    return (
        <ThemedView style={styles.container}>
            {/* <NetworkStatus /> */}

            {/* Fondo gris */}
            <View style={styles.background} />

            {/* Header con título */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Validación de documento de transporte</Text>
                <View style={styles.placeholder} />
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
                            {guide?.details?.map((address) =>
                                address.pedidos.map((pedido) => (
                                    <View key={pedido.id} style={styles.secondCard}>

                                        {/* Header */}
                                        <View style={styles.orderHeader}>
                                            <Text style={styles.orderTitle}>
                                                Pedido {pedido.id}
                                            </Text>

                                            <Text style={styles.productCount}>
                                                {pedido.detalles.length} productos
                                            </Text>
                                        </View>

                                        <View style={styles.divider} />
                                        <View key={pedido.id} style={styles.gap}>
                                            {/* Productos */}
                                            {pedido.detalles.map((item) => (
                                                <View key={item.id} style={styles.productRow}>
                                                    <Text numberOfLines={1} style={styles.productName}>
                                                        {item.producto.nombre.charAt(0).toUpperCase() + item.producto.nombre.slice(1).toLowerCase()}                                                </Text>

                                                    <Text style={styles.units}>
                                                        {item.unidadesSolicitadas} uds.
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                    </View>
                                ))
                            )}
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
        paddingBottom: 30,
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
    }
});

