import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { DetailsGudes } from '@/components/generals/DetailsGudes';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { GuideCard } from '@/components/generals/GuideCard';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { TodayDeliveries } from '@/components/generals/TodayDeliveries';
import { SearchInput } from '@/components/inputs/SearchInput';
import { GuideCardSkeleton } from '@/components/skeleton/GuideCardSkeleton';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import { StatusInvoice, StatusInvoiceID } from '@/src/constants/GuideStates';
import { GuideDetails, PaymentsByInvoice } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { getDeviceDateTime } from '@/src/utils/uitls';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image, ScrollView, StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface DetailsFormProps {
    initialGuide?: string;
    token?: string;
    onSubmit: (params: { guide: string; token: string }) => void | Promise<void>;
}

export function DetailsForm({ initialGuide = "", token = "", onSubmit }: DetailsFormProps) {
    const [guide, setGuide] = useState(initialGuide);
    const [tokenUser, setToken] = useState<string | null>(null);
    const [data, setData] = useState<GuideDetails[]>([]);
    const [dataResult, setDataResult] = useState<PaymentsByInvoice | null>(null);
    const [filteredGuides, setFilteredGuides] = useState(data);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [statusValue, setStatusValue] = useState("");
    const [runApiFinish, setRunApiFinish] = useState(false);
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [waitingForPermission, setWaitingForPermission] = useState(false);
    const [date, setDate] = useState<string | null>(null);

    const btnRef = useRef<any>(null);
    const router = useRouter();

    const isValid = guide.length >= 5;

    useEffect(() => {
        const fetchToken = async () => {
            const savedToken = await SecureStore.getItemAsync('user_token');
            setToken(savedToken);
        };
        fetchToken();
    }, []);

    useEffect(() => {
        const fetchPermissions = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("Permiso denegado ¡Alerta!");
                setModalMessage("Se requiere acceso a la ubicación.");
                setLoading(false);
                setModalVisible(true);
                setWaitingForPermission(true);
                return;
            } else {
                setWaitingForPermission(false);
            }
        };
        fetchPermissions();
    }, []);

    useEffect(() => {
        if (!modalVisible && waitingForPermission) {
            const recheckPermissions = async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setModalVisible(true);
                } else {
                    setWaitingForPermission(false);
                    setValidateException(false);
                }
            };
            recheckPermissions();
        }
    }, [modalVisible, waitingForPermission]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await detailsRepositoryImpl.listGuide(Number(guide), tokenUser || token);
                if (response?.statusCode == 200) {
                    if (response?.data) {
                        const arrayData = Array.isArray(response.data) ? response.data : [response.data];

                        const sortedData = arrayData
                            .filter(item => typeof item !== 'string')
                            .sort((a, b) => {
                                const aIsPending = (a as GuideDetails).estado?.toLowerCase() === "pendiente";
                                const bIsPending = (b as GuideDetails).estado?.toLowerCase() === "pendiente";

                                if (aIsPending && !bIsPending) {
                                    return -1;
                                } else if (!aIsPending && bIsPending) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                        const hasInCourse = sortedData.every(
                            item => (item as GuideDetails).estado?.toLowerCase() === StatusInvoice.CLOSE_TWO.toLowerCase()
                        );

                        if (hasInCourse) {
                            await finshRoute();
                        }
                        const responseData = await detailsRepositoryImpl.paymentsByGuide(
                            {
                                id_guia: String(guide),
                            },
                            ENV_DEV.KEY_APP
                        );

                        setDataResult(responseData?.data?.resumen);
                        
                        // Asignar la variable según el resultado
                        setData(sortedData as GuideDetails[]);
                        setFilteredGuides(sortedData as GuideDetails[]);
                        await getStatusStyle();
                    }

                } else {
                    setData([]);
                    setFilteredGuides([]);
                }

            } catch (error: any) {
                setModalTitle("¡Error!");
                setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
                setModalVisible(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [guide, tokenUser || token]);

    const getStatusStyle = async () => {
        try {
            const responseQuery = await detailsRepositoryImpl.listRouteByCodeGuide(Number(guide), tokenUser || token);
            if (responseQuery?.statusCode == 200) {
                if (typeof responseQuery.data === "object" && !Array.isArray(responseQuery.data)) {
                    switch (responseQuery?.data?.estado_id) {
                        case StatusInvoiceID.IN_COURSE:
                            setStatusValue(StatusInvoice.IN_COURSE);
                            setDate(await SecureStore.getItemAsync('expiration_date'));
                            setRunApiFinish(false);
                            setRouteStarted(true);
                            break;

                        case StatusInvoiceID.PENDING:
                            setStatusValue(StatusInvoice.PENDING);
                            setRunApiFinish(false);
                            setRouteStarted(false);
                            break;

                        case StatusInvoiceID.CLOSE:
                            setDate(await SecureStore.getItemAsync('expiration_date'));
                            setStatusValue(StatusInvoice.CLOSE);
                            setRunApiFinish(true);
                            setRouteStarted(true);
                            break;

                        default:
                            setStatusValue("No tine estado");
                    }

                }
            }

            if (runApiFinish) {
                await finshRoute();
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    const finshRoute = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            const responseData = await detailsRepositoryImpl.closeRouteInit(
                {
                    codigoGuia: String(guide),
                    latitud: String(location.coords.latitude),
                    longitud: String(location.coords.longitude),
                    fechaHoraDispositivo: getDeviceDateTime()
                },
                token
            );
            if (responseData?.statusCode != 200) {
                setModalTitle("¡Alerta!");
                setModalMessage(responseData?.message ?? "Ocurrio un error inesperado.");
                setModalVisible(true);
            }
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }
    const handleExit = async () => {
        setLoading(true);
        await SecureStore.deleteItemAsync('user_token');
        setDate(null);
        setTimeout(() => {
            setLoading(false);
            router.replace('/auth/login');
        }, 1200);
    };

    const handleSubmit = async () => {
        try {

            setLoading(true);
            const initDate = getDeviceDateTime()
            setDate(initDate)
            await SecureStore.setItemAsync('expiration_date', initDate);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            const response = await detailsRepositoryImpl.sendRouteInit(
                {
                    codigoGuia: String(guide),
                    latitud: String(location.coords.latitude),
                    longitud: String(location.coords.longitude),
                    fechaHoraDispositivo: initDate
                },
                token
            );
            if (response?.statusCode == 200) {
                await getStatusStyle();
                setRouteStarted(true);
                setLoading(false);
            } else {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage(response?.data?.message ?? "Ocurrio un error inesperado.");
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

    return (
        <ThemedView style={styles.container}>
            {/* <NetworkStatus /> */}

            <View style={[styles.backgroundFill, { width, height }]} pointerEvents="none">
                <Image
                    source={require('@/assets/icons/Welcome.png')}
                    style={[styles.backgroundImage, { width, height }]}
                    resizeMode="cover"
                />
            </View>

            <DetailsGudes
                style={styles.logo}
                guide={Number(guide)}
                onExit={handleExit}
                date={date ? date : undefined}
                routeStarted={routeStarted}
                statusName={statusValue}
            />

            <View style={[
                styles.whitePanel,
                { height: height - 200 }
            ]}>
                <View style={styles.content}>

                    <View style={styles.topContent}>

                        <View style={{ marginTop: -40 }}>
                            <TodayDeliveries
                                data={data}
                                routeStarted={routeStarted}
                                waitingForPermission={waitingForPermission}
                                dataResult={dataResult}
                            />
                        </View>
                        <Text style={styles.title}>Tu ruta</Text>
                        <SearchInput
                            data={data}
                            keyExtractor={(item) => `${item.nombreCliente} ${item.codigoCliente}`}
                            onSearch={setFilteredGuides}
                            placeholder="Buscar por cliente o código"
                        />
                        <ScrollView
                            style={styles.guidesScroll}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {((data.length === 0) || (waitingForPermission)) ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <GuideCardSkeleton key={i} />
                                ))
                            ) :
                                // Si ya se cargó data pero la búsqueda no encontró nada
                                filteredGuides.length === 0 ? (
                                    <View style={styles.noResultsContainer}>
                                        <Text style={styles.noResultsTitle}>No encontramos resultados</Text>
                                        <Text style={styles.noResultsSubtitle}>Ningún registro coincide con la búsqueda</Text>
                                    </View>
                                ) : (
                                    filteredGuides.map((item) => (
                                        <GuideCard
                                            key={item.codigoCliente}
                                            guide={item}
                                            onPress={() => console.log('Ir a dirección')}
                                            routeStarted={statusValue != StatusInvoice.PENDING ? true : routeStarted}
                                            numberGuide={String(guide)}
                                            token={token}
                                        />
                                    ))
                                )
                            }
                        </ScrollView>
                    </View>

                    {(!routeStarted && (statusValue == StatusInvoice.PENDING)) && (
                        <View style={{ alignItems: 'center', marginBottom: 25 }}>
                            <PrimaryButtonDetails
                                ref={btnRef}
                                title="Comenzar ruta"
                                onPress={handleSubmit}
                                disabled={!isValid}
                                width={328}
                                height={43}
                                autoReset={validateException}
                            />
                        </View>
                    )}
                    <ExceptionModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title={modalTitle}
                        message={modalMessage}
                        buttonLabel={modalButtonLabel}
                    />
                </View>
            </View>
            {loading && <LoadingBlue />}

        </ThemedView>
    );
}
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
    },
    backgroundFill: {
        backgroundColor: '#164194',
    },
    backgroundImage: {
        zIndex: 1,
    },
    separator: {
        position: 'absolute',
        height: 5,
        transform: [{ rotate: '-15deg' }],
        zIndex: 2,
    },
    logo: {
        zIndex: 10,
        position: 'absolute',
        top: 100,
    },
    whitePanel: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        padding: 27,
        zIndex: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topContent: {
        flex: 1,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "700",
        fontSize: 24,
        textAlign: "left",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
        textAlign: "center",
    },
    buttonContainer: {
        width: "100%",
        alignItems: 'center',
    },
    guidesScroll: {
        maxHeight: 400,
        marginTop: 12,
    },
    noResultsContainer: {
        width: 328,
        alignItems: 'center',
        marginTop: 40,
    },
    noResultsTitle: {
        width: 328,
        height: 19,
        fontFamily: "Rubik",
        fontWeight: "700",
        fontSize: 16,
        lineHeight: 19,
        textAlign: "center",
        color: "#788095",
        marginBottom: 8,
    },
    noResultsSubtitle: {
        width: 328,
        height: 14,
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 12,
        lineHeight: 14,
        textAlign: "center",
        color: "#788095",
    },
});