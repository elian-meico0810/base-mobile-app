import SecurityAlert from '@/components/alerts/SecurityAlert';
import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { DetailsGudes } from '@/components/generals/DetailsGudes';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { GuideCard } from '@/components/generals/GuideCard';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { ScanQRCard } from '@/components/generals/ScanQRCard';
import { TodayDeliveries } from '@/components/generals/TodayDeliveries';
import { SearchInput } from '@/components/inputs/SearchInput';
import { UploadPhotoItem } from '@/components/photo/uploadPhotoItem';
import { GuideCardSkeleton } from '@/components/skeleton/GuideCardSkeleton';
import { ThemedView } from '@/components/themed-view';
import { ENV_DEV } from '@/src/constants/apiRoutes';
import { GuideState, StatusInvoice, StatusInvoiceID, TypeConPagoEnum, TypeDetailsEnum, TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { ConsignmentData } from '@/src/features/detailsInvoice/components/ConsignmentData';
import { QRScanner } from '@/src/features/detailsInvoice/components/qrScanner';
import { GuideDetails, PaymentsByInvoice } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { getDeviceDateTime, heightCaldulate } from '@/src/utils/uitls';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from "react";
import {
    AppState,
    AppStateStatus,
    Dimensions,
    Image,
    ScrollView, StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface DetailsFormProps {
    initialGuide?: string;
    token?: string;
    onSubmit: (params: { guide: string; token: string }) => void | Promise<void>;
    showAlert: boolean;
}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

export function DetailsForm({ initialGuide = "", token = "", onSubmit, showAlert }: DetailsFormProps) {
    const [guide, setGuide] = useState(initialGuide);
    const [tokenUser, setToken] = useState<string | null>(null);
    const [data, setData] = useState<GuideDetails[]>([]);
    const [dataResult, setDataResult] = useState<PaymentsByInvoice | null>(null);
    const [filteredGuides, setFilteredGuides] = useState(data);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(false);
    const [showViewConsignment, setViewConsignment] = useState(false);
    const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
    const [uploadPhoto, setUploadPhoto] = useState(false);
    const [uploadPhotoFile, setUploadPhotoFile] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleTwo, setModalVisibleTwo] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [checkUbication, setCheckUbication] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [statusValue, setStatusValue] = useState("");
    const [valueInput, setValueInput] = useState("");
    const [runApiFinish, setRunApiFinish] = useState(false);
    const [valueParameterized, setValueParameterized] = useState(false);
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [waitingForPermission, setWaitingForPermission] = useState(false);
    const [viewshowAlert, setViewshowAlert] = useState(showAlert);
    const [showSuccess, setShowSuccess] = useState(false);
    const [date, setDate] = useState<string | null>(null);
    const btnRef = useRef<any>(null);
    const router = useRouter();

    const isValid = guide.length >= 5;
    const isSmallScreen = height <= 780;

    const heightValue = heightCaldulate();

    const params = useLocalSearchParams();
    const success = params?.success as string | undefined;

    const [routeCompleted, setRouteCompleted] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);

    useEffect(() => {
        const totalVisits = data.length;

        const completedVisits = data.filter(
            d => d.estado === GuideState.Cerrada
        ).length;

        const completed = totalVisits > 0 && completedVisits === totalVisits;

        setRouteCompleted(completed);
    }, [data]);

    useEffect(() => {
        const fetchToken = async () => {
            const savedToken = await SecureStore.getItemAsync('user_token');

            if (!savedToken) return;

            setToken(savedToken);

            await listReportPaymentByCOideGuide(savedToken);
        };

        fetchToken();
    }, []);


    // Listener de AppState mejorado
    useEffect(() => {
        let isMounted = true;
        let checkTimeout: ReturnType<typeof setTimeout> | null = null;

        const appStateRef = { current: AppState.currentState };

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appStateRef.current.match(/background|inactive/) &&
                nextAppState === 'active') {

                if (checkTimeout) {
                    clearTimeout(checkTimeout);
                    checkTimeout = null;
                }

                checkTimeout = setTimeout(async () => {
                    if (!isMounted || !waitingForPermission) return;

                    const { status } = await Location.requestForegroundPermissionsAsync();

                    if (status === 'granted') {
                        setModalVisible(false);
                        setWaitingForPermission(false);
                    }
                }, 500);
            }

            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            isMounted = false;
            if (checkTimeout) {
                clearTimeout(checkTimeout);
            }
            subscription.remove();
        };
    }, [waitingForPermission]);


    // Función para verificar permisos
    const checkLocationPermissions = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                // Permiso denegado
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("Permiso denegado ¡Alerta!");
                setModalMessage("Se requiere acceso a la ubicación.");
                setLoading(false);
                setModalVisibleTwo(true);
                setWaitingForPermission(true);
            } else {
                setWaitingForPermission(false);
                setModalVisibleTwo(false);
                setLoading(false);
            }
        } catch (error) {
            setWaitingForPermission(false);
        }
    };

    // Función para verificar permisos
    const listReportPaymentByCOideGuide = async (authToken: string) => {
        try {

            const responseQueryData = await invoiceRepositoryImpl.successTypeCashPayment(
                String(initialGuide),
                authToken
            );
            let total = 0;

            if (responseQueryData?.statusCode === 200) {
                const data = responseQueryData.data as any;
                total = data?.totalEfectivo

                // setValuePaymentByType(total);
                if (total) {
                    const response = await invoiceRepositoryImpl.typeParameterValue(
                        TypeDetailsEnum.MAXIMUM_AMOUNT,
                        authToken
                    );

                    if (Array.isArray(response?.data)) {
                        const parameterToalas = response.data.reduce((acc: number, item: any) => {
                            const numero = Number(item.valor);
                            return !isNaN(numero) ? acc + numero : acc;
                        }, 0);

                        if (total >= parameterToalas) {
                            setValueParameterized(true);
                        }
                    }

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
        const fetchPermissions = async () => {
            await checkLocationPermissions();
        };

        if (token && !waitingForPermission) {
            fetchPermissions();
        }
    }, [token, !waitingForPermission]);

    useEffect(() => {
        if (success === "route_closed") {
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
            }, 4000);
        }
    }, [success]);


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
                            //await finshRoute();
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
                            //setRunApiFinish(true);
                            setRouteStarted(true);
                            break;

                        default:
                            setStatusValue("No tine estado");
                    }

                }
            }

            if (runApiFinish) {
                //await finshRoute();
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

    const hasValidInvoice = data.some((direccion) =>
        direccion.facturas?.some(
            (factura) =>
                factura.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO ||
                factura.tipoCliente === TypeConPagoEnum.TAT
        )
    );

    const consignmentSubmit = async () => {
        try {
            setShowSuccess(true);
            setViewConsignment(false);
            setUploadPhoto(false);
            // setValueInput("");
            // setMultiplePhotos([]);


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

            <View style={[styles.backgroundFill,]} >
                <Image
                    source={require('@/assets/icons/Welcome.png')}
                    style={[styles.backgroundImage, { width, height: '100%' }]}
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

            {showSuccess && (
                <TopSuccessAlert
                    visible={showSuccess}
                    message="Consignación registrada"
                    onHide={() => setShowSuccess(false)}
                    subtitle={`Se registró una consignación por el valor de $${valueInput}.`}
                />
            )}

            {showSuccess && (
                <TopSuccessAlert
                    visible={showSuccess}
                    message="Ruta cuadrada"
                    onHide={() => setShowSuccess(false)}
                    subtitle={`La ruta #${guide} fue cuadrada con éxito`}
                />
            )}

            <View style={[
                styles.whitePanel,
                { height: height - (heightValue ? 150 : 200) }
            ]}>

                <View style={styles.content}>

                    <View style={styles.topContent}>

                        <View style={{ marginTop: -40 }}>
                            <TodayDeliveries
                                data={data}
                                routeStarted={routeStarted}
                                waitingForPermission={waitingForPermission || !checkUbication}
                                dataResult={dataResult}
                            />

                            {((data.length != 0)) && (
                                <>
                                    {(hasValidInvoice && !valueParameterized) && (

                                        <TouchableOpacity style={styles.cardConsignment} onPress={() => {
                                            router.push({
                                                pathname: '/views/consignaciones',
                                                params: { codigoGuia: guide }
                                            });
                                        }}>
                                            <View style={styles.leftContent}>
                                                <Image
                                                    source={require('@/assets/icons/ConsignmentIcons.png')}
                                                    style={styles.icon}
                                                />
                                                <Text style={styles.titleConsignment}>Consignaciones</Text>
                                            </View>

                                            <Image
                                                source={require('@/assets/icons/ChevronRight.png')}
                                                style={styles.chevron}
                                            />

                                        </TouchableOpacity>
                                    )}
                                    <View style={{ marginBottom: 10 }}>
                                        {(hasValidInvoice && valueParameterized) && (
                                            <SecurityAlert
                                                height={130}
                                                title="Superaste el tope de seguridad de efectivo."
                                                subtitle="Realiza una consignación en el punto de recaudo más cercano."
                                                buttonLabel="Registrar consignación"
                                                onPress={() => router.push({
                                                    pathname: '/views/consignaciones',
                                                    params: { codigoGuia: guide, statusConsignment: 'true' }
                                                })}
                                            />
                                        )}
                                    </View>

                                </>
                            )}

                            {routeCompleted && statusValue !== StatusInvoice.CLOSE && (
                                <ScanQRCard onScan={() => setShowScanner(true)} />
                            )}

                            {/* Si estado es CLOSE → Mostrar botón Cuadre de ruta */}
                            {statusValue === StatusInvoice.CLOSE && (
                                <TouchableOpacity
                                    style={styles.cardConsignment}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/views/conciliationSummary" as any,
                                            params: {
                                                guide,
                                                token: tokenUser,
                                            },
                                        });
                                    }}
                                >
                                    <View style={styles.leftContent}>
                                        <Image
                                            source={require('@/assets/icons/ConciliationSummary.png')}
                                            style={styles.icon}
                                        />
                                        <Text style={styles.titleConsignment}>
                                            Cuadre de ruta
                                        </Text>
                                    </View>

                                    <Image
                                        source={require('@/assets/icons/ChevronRight.png')}
                                        style={styles.chevron}
                                    />
                                </TouchableOpacity>
                            )}

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
                            {((data.length === 0) || (waitingForPermission || !checkUbication)) ? (
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
                                            key={item.idDireccion}
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
                        <View style={{ alignItems: 'center', marginBottom: isSmallScreen ? 0 : 30 }}>
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

                    {(showViewConsignment) && (
                        <ConsignmentData
                            title="Registrar consignación"
                            subTitle="Ingresa el valor y adjunta una foto del comprobante."
                            onClose={() => {
                                setViewConsignment(false);
                                setUploadPhoto(false);
                                setValueInput("");
                                setMultiplePhotos([]);
                            }}
                            width={width}
                            visible={showViewConsignment}
                            titleTwo="Comprobante de la consignación"
                            onUploadFile={() => {
                                setViewConsignment(false);
                                setUploadPhoto(true);
                            }}
                            evidencePhotos={multiplePhotos}
                            onValue={(value) => {
                                setValueInput(value);
                            }}
                            value={valueInput}
                            onConfirmation={consignmentSubmit}
                        />
                    )}

                    {(uploadPhoto) && (
                        <UploadPhotoItem
                            title="Cargar evidencia"
                            subTitle="Toma fotos de la mercancía ubicada en el cliente. Podrás asociar un máximo de 3 imágenes por entrega."
                            onClose={() => {
                                setUploadPhoto(false);
                                setViewConsignment(true);
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

                            visible={uploadPhoto}
                        />
                    )}


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
                            setWaitingForPermission(false);
                        }}
                        title={modalTitle}
                        message={modalMessage}
                        buttonLabel={modalButtonLabel}
                        showSettingsButton={true}
                        settingsButtonLabel="Abrir Ajustes"
                    />


                </View>
            </View>

            <QRScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onRead={async (qrToken) => {
                    try {
                        setShowScanner(false);

                        await detailsRepositoryImpl.validateCediQR(
                            qrToken,
                            tokenUser || ""
                        );

                        router.push({
                            pathname: "/views/conciliation",
                            params: {
                                guide,
                                token: tokenUser,
                            },
                        });

                    } catch (e) {
                        setModalTitle("¡Atención!");
                        setModalMessage("El QR escaneado no es válido");
                        setModalVisible(true);
                    }
                }}
            />

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />
            
            {viewshowAlert && (
                <TopSuccessAlert
                    visible={viewshowAlert}
                    message={`El documento de transporte ${initialGuide} ha sido aceptado con éxito.`}
                    onHide={() => setViewshowAlert(false)}
                />
            )}
            {loading && <LoadingBlue />}

        </ThemedView>
    );
}
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
    },
    cardConsignment: {
        width: width * 0.9,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignSelf: 'center',
        marginBottom: 16,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 16,
        height: 16,
        tintColor: '#141D32',
        marginRight: 8,
    },
    titleConsignment: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 16,
        color: '#141D32',
    },
    chevron: {
        width: 16,
        height: 16,
        tintColor: '#141D32',
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
