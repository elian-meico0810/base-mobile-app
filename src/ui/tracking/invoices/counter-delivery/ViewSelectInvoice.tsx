import { PaymentPendingAlert } from '@/components/alerts/PaymentPendingAlert';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { ThemedView } from '@/components/themed-view';
import { TypeCaculateValueEnum, TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { Detail, Document, GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { DerliveryDocument, Invoice } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { invoiceRepositoryImpl } from '@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl';
import { calculateVlueByPorducts, capitalizeFirst, cleanSpaces, getDeviceDateTime, getDistanceInMeters, heightCaldulate, toUpperCase } from '@/src/utils/uitls';
import { Image } from 'expo-image';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface ViewSelectInvoiceProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    routeStartedBotton?: string;
    detailsCounterDelivery?: boolean;

}

export function ViewSelectInvoice({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, routeStartedBotton, detailsCounterDelivery }: ViewSelectInvoiceProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [showPayment, setShowPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [conceptDelivery, setConceptDelivery] = useState<DerliveryDocument[]>([]);
    const [isValidData, setIsValidData] = useState(false);
    const [showPaymentPending, setShowPaymentPending] = useState(false);
    const [isEquals, setIsEquals] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentSuccessful, setPaymentSuccessful] = useState<Invoice[]>([]);
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [EntryVisible, setEntryVisible] = useState(false);
    const [validateException, setValidateException] = useState(false);
    const [validateIsBotton, setvalidateIsBotton] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<GuideDetails | null>(null);
    const [activeView, setActiveView] = useState(true);
    const [buttonValue, setButtonValue] = useState(false);
    const [allowBack, setAllowBack] = useState(false);
    const btnRef = useRef<any>(null);
    const router = useRouter();
    const [typePayment, setTypePayment] = useState(false);
    const [valueOrderCalculate, setValueOrderCalculate] = useState(0);
    const [checkUbication, setCheckUbication] = useState(false);
    const [showPorductData, setPorductData] = useState<Document[]>([]);
    const [valueOrderPaymentByType, setValuePaymentByType] = useState(0);

    const heightValue = heightCaldulate();


    const handleGoBack = () => {
        // router.back();
        router.push(
            `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
        );
    };


    const getSuccessOrderPayment = async () => {
        try {
            const idsArray = initialGuide?.pedidos?.map(p => p.id) ?? [];
            const ids = idsArray.join(",");

            const responseQueryData = await invoiceRepositoryImpl.successOrderArrayPayment(
                ids,
                token
            );
            if (responseQueryData?.statusCode === 200 && Array.isArray(responseQueryData.data)) {
                const total = responseQueryData.data?.[0].valorRegistrado

                setValuePaymentByType(total);
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
        if (token) {
            listGuideData();
        }
    }, [token]);

    useEffect(() => {
        if (guide?.fecha_apertura && !buttonValue) {
            listDocumentQuery();
            setButtonValue(true);
        }
    }, [token]);

    const handleInvoiceSelect = (selectedGuide: GuideDetails | null) => {
        try {
            setSelectedInvoice(selectedGuide);

            if (!routeStarted && !conditionButton && !buttonValue) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe confirmar que ya ha llegado a la dirección.");
                setModalVisible(true);
                return;
            }
            if (selectedInvoice) {
                router.push(
                    `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(selectedInvoice))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}&isSelectInvocies=${'true'}`
                );
            }
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
            setLoading(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            if (guide?.latitud && guide?.longitud) {
                const distance = getDistanceInMeters(Number(guide?.latitud), Number(guide?.longitud), Number(location.coords.latitude), Number(location.coords.longitude));
                const isInsideRange = distance <= 100;
                if (!isInsideRange) {
                    btnRef.current?.reset();
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
                setvalidateIsBotton(true);
                setEntryVisible(true);
                setRouteStarted(true);
                setShowDetailInvoiceQR(false);
                setShowPayment(false);
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
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

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

    const submitData = async () => {
        try {
            if (conceptDelivery?.length != guide?.facturas?.length) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar un estado de entrega.");
                setModalVisible(true);
                return;
            }
            if (!isEquals) {
                setValidateException(true);
                btnRef.current?.reset();
                setModalTitle("¡Alerta!");
                setModalMessage("Debe especificar los estados de entrega por factura.");
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
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    const listGuideData = async () => {
        try {
            setLoading(true);
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
                        facturas: clienteEncontrado.facturas
                    });
                    listDocumentQuery();

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

    const listDocumentQuery = async () => {
        try {
            setLoading(true);
            const responseQuery = await invoiceRepositoryImpl.listDocument(
                null,
                Number(guide?.idDireccion),
                token
            );
            let conceptList: DerliveryDocument[] = [];

            if (responseQuery?.statusCode === 200) {
                if (Array.isArray(responseQuery.data)) {
                    conceptList = responseQuery.data;
                } else if (responseQuery.data && typeof responseQuery.data === "object") {
                    conceptList = [responseQuery.data];
                } else {
                    conceptList = [];
                }
                const facturaNumbers = guide?.facturas?.map(f => f.numeroFactura) ?? [];
                const documentNumbers = conceptList.map(c => c.documentMeico);

                const isValid = facturaNumbers.every(numero =>
                    documentNumbers.includes(numero)
                );
                if (isValid) {
                    setIsValidData(true);
                }
                setConceptDelivery(conceptList)
                setLoading(false);
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
        if (conceptDelivery.length > 0 && guide) {
            const numerosFacturas = guide.facturas.map(factura => factura.numeroFactura);
            const documentosMeico = conceptDelivery.map(item => item.documentMeico);
            // Ordenar y comparar como strings
            numerosFacturas.sort();
            documentosMeico.sort();

            const equals = JSON.stringify(numerosFacturas) === JSON.stringify(documentosMeico);
            setIsEquals(equals)
        }
    }, [conceptDelivery, guide]);

    useEffect(() => {
        const fetchGuide = async () => {
            try {

                const invoices = initialGuide?.facturas?.map(p => p.numeroFactura) ?? [];
                const numeroFactura = invoices.join(",");

                const idsArray = initialGuide?.pedidos?.map(p => p.id) ?? [];
                const ids = idsArray.join(",");

                const respones = await invoiceRepositoryImpl.successfulBillArrayPayment(
                    numeroFactura,
                    token,
                    ids
                );
                if (respones?.statusCode === 200) {
                    setPaymentSuccessful(respones.data as Invoice[]);
                }
            } catch (error) {
                setModalTitle("¡Error!");
                setModalMessage("Ocurrio un error inesperado.");
                setModalVisible(true);
            } finally {
                setLoading(false);
            }
        };
        getSuccessOrderPayment();
        fetchGuide();
    }, [Number(initialGuide?.facturas[0]?.numeroFactura), token]);


    const totalApproved = (paymentSuccessful ?? [])
        .flatMap(invoice => invoice.pagos ?? [])
        .filter(pago => pago.estado === "APPROVED")
        .reduce((sum, pago) => sum + (Number(pago?.valorPagado) || 0), 0);

    const totalFacturas = guide?.facturas?.reduce((sum, factura) => {
        const valorTotal = Number(factura?.valorTotal || 0);
        const dfr = Number(factura?.dfr || 0);
        return sum + (valorTotal - dfr);
    }, 0) || 0;

    const totalvalorTotal = (guide?.facturas ?? [])
        .reduce((acc, factura) => {
            return acc + Number(factura?.valorTotal ?? 0);
        }, 0);

    const totalDfr = (guide?.facturas ?? [])
        .reduce((acc, factura) => {
            return acc + Number(factura?.dfr ?? 0);
        }, 0);

    const totalRecauder = Math.max(0, totalFacturas - totalApproved);
    const conditionButton = conceptDelivery.length != 0 || routeStarted;
    const validateCheckboxlength = conceptDelivery.length == guide?.facturas?.length

    const isSmallScreen = height <= 780;
    const conceptDeliveryValue = conceptDelivery.length > 0
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

    const totalValue =
        Number(
            (
                (Number(totalvalorTotal) -
                    Number(totalDfr)) -
                Number(valueOrderCalculate)
            ).toFixed(2)
        );

    const totalOrderPayment = Number(totalApproved) + Number(valueOrderPaymentByType);

    useEffect(() => {
        if (detailsCounterDelivery || closeButton) {
            const total =
                showPorductData?.[0]?.detalles?.reduce((suma, detalle) => {
                    return (
                        suma +
                        calculateVlueByPorducts(
                            detalle as Detail,
                            TypeCaculateValueEnum.ACTION_5
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
                ]}
                showsVerticalScrollIndicator={false}
            >

                {/* Card blanco centrado */}
                <View style={styles.card}>

                    {/* Línea divisoria */}
                    <View style={styles.orderInfo}>

                        <View style={styles.storeRow}>
                            <Image
                                source={require("@/assets/icons/HouseIcon.png")}
                                style={styles.storeIcon}
                                contentFit="contain"
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
                                contentFit="contain"
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
                                contentFit="contain"
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
                                contentFit="contain"
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
                                contentFit="contain"
                            />
                            <View style={styles.storeText}>
                                <Text style={styles.labelTwo}>N° de factura</Text>
                                <Text style={styles.value}>
                                    {
                                        guide?.facturas?.length
                                            ? guide.facturas
                                                .map(f => f.numeroFactura)
                                                .join(' / ')
                                            : '0'
                                    }
                                </Text>
                                <Text style={styles.labelThree}>{guide?.facturas?.length} facturas asociadas</Text>

                            </View>
                        </View>
                    </View>
                </View>


                <View style={[styles.cardTwo, { minHeight: !closeButton ? undefined : 229 }]}>
                    {/* Encabezado */}
                    {(detailsCounterDelivery || closeButton) && (
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
                            <Text style={styles.value}>{'$ ' + (Number(totalvalorTotal) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Descuento financiero</Text>
                            <Text style={[styles.value, { color: '#1F9144' }]}>
                                {'$ - ' + Number(totalDfr).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </Text>
                        </View>
                        {(detailsCounterDelivery || closeButton) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Productos rechazados</Text>
                                <Text style={styles.value}>{'$ ' + Number(valueOrderCalculate).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text style={styles.labelTotal}>Valor total</Text>
                            <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                                {'$ ' + Number(totalValue || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
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
                                    color: Number(totalRecauder) === 0 ? '#1F9144' : '#C62828',
                                    fontWeight: '800',
                                    fontSize: 16
                                }
                            ]}>
                                {'$ ' + (Number(totalRecauder) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </Text>
                        </View>

                        {(detailsCounterDelivery || closeButton) && (
                            totalRecauder != 0 ? (
                                <TouchableOpacity
                                    style={styles.qrButton}
                                    onPress={() => {
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
                            console.log('HOLA SI SE PRESIONO');
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

                {/* <View style={styles.headerContainerTwo}>
                    <Text style={styles.headerTitleTWO}>Ordenes a entregar</Text>
                </View>

                <View style={{ flex: 1, padding: 16 }}>
                    <InvoicesList guide={guide}
                        onInvoiceSelect={handleInvoiceSelect}
                        documentMeico={documentMeico}
                        numberGuide={numberGuide}
                        isSelectInvocies={isSelectInvocies}
                        token={token}
                        conceptDelivery={conceptDelivery}
                        activeView={activeView}
                    />
                </View> */}
            </ScrollView>
            {guide?.estado === 'Pendiente' && (
                <View style={[styles.redBackground, { height: heightValue ? 100 : 90 }]} />
            )}

            <View style={[styles.footer, {
                marginBottom: isSmallScreen ? 0 : heightValue ? 0 : 20,
                bottom: isSmallScreen ? 12 : heightValue ? 60 : 30
            }]}>
                {guide?.estado === 'Pendiente' && (
                    <PrimaryButtonDetails
                        ref={btnRef}
                        autoReset={validateException}
                        key={conditionButton || buttonValue ? "cerrar" : "llegue"}
                        title={conditionButton || buttonValue ? "Cerrar pedido" : "Ya llegué"}
                        onPress={conditionButton || buttonValue ? submitData : handleSubmit}
                        disabled={false}
                        width={328}
                        height={43}
                        buttonColor={validateCheckboxlength ? undefined : !validateCheckboxlength || conditionButton ? "#DDDFE8" : undefined}
                        buttonColorEnd={validateCheckboxlength ? undefined : !validateCheckboxlength || conditionButton ? "#DDDFE8" : undefined}
                        titleColor={!conceptDeliveryValue || conditionButton ? "#FFFFFF" : undefined}
                        circleColor={validateCheckboxlength ? undefined : !validateCheckboxlength || conditionButton ? "#788095" : undefined}
                    />
                )}
            </View>

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
    labelThree: {
        fontFamily: 'Rubik',
        fontWeight: '200',
        fontSize: 11,
        color: '#788095',
    },
});

