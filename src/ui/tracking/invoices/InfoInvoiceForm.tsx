import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { ThemedView } from '@/components/themed-view';
import { TypeQr } from '@/src/constants/GuideStates';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { ChangePhoneModal } from '@/src/features/tracking/components/screens/ChangePhoneModal';
import { DetailsInvoiceQR } from '@/src/features/tracking/components/screens/DetailsInvoiceQR';
import { InfoPayments } from '@/src/features/tracking/components/screens/InfoPayments';
import { ViewQrModal } from '@/src/features/tracking/components/screens/ViewQrModal';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { cleanSpaces } from '@/src/utils/uitls';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface InfoInvoiceFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
}

export function InfoInvoiceForm({ initialGuide, token = "", onSubmit }: InfoInvoiceFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showDetailInvoiceQR, setShowDetailInvoiceQR] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalButtonLabel, setModalButtonLabel] = useState("Entendido");
    const [showChangePhone, setShowChangePhone] = useState(false);
    const [modalgenerateQR, setModalgenerateQR] = useState(false);
    const [sendWhatsApp, SetSendWhatsApp] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSuccessQRp, setShowSuccessQRP] = useState(false);
    const [qrBase64, setQrBase64] = useState<string>('');
    const [qrType, setQrType] = useState<string>('');
    const [phone, setPhone] = useState("");

    const isValid = true;
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };

    const handleGenerateQR = (type: string, qr?: string) => {
        setModalgenerateQR(true);
        setShowDetailInvoiceQR(false);
        setShowPayment(false);
        if (qr) setQrBase64(qr);
        if (type) setQrType(type);
    };


    const handlSendWhatsApp = async () => {
        try {
            if (qrType == TypeQr.PASARELA) {
                setShowSuccessQRP(true);
                setModalgenerateQR(false);
                // setModalVisible(true);

                // const response = await detailsRepositoryImpl.reportWhatsApp(
                //     {
                //         whatsapp: String(phone),
                //         nombre_cliente: String(guide?.nombreCliente),
                //         link_pago: String(qrBase64),
                //     },
                //     ENV_DEV.KEY_APP
                // );
                // if (response?.statusCode != 200) {
                //     setModalTitle("Alerta !!");
                //     setModalMessage(response?.message ?? "Ocurrio un error inesperado.");
                //     setModalVisible(true);
                // }
            }
        } catch (error: any) {
            setModalTitle("Error !!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }
    const handleSubmit = async () => {

        try {
            console.log("entro ala funcion")
            setRouteStarted(true);

        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const submitData = async () => {

        try {
            console.log("entro ala funcion")
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const validateButton = async () => {
        try {
            setShowDetailInvoiceQR(false);
            setShowPayment(false);
            if (!routeStarted) {
                setModalTitle("Alerta !!");
                setModalMessage("Debe indicar que ya llegó al lugar de la dirección para poder ejecutar esta acción.");
                setModalVisible(true);

            }
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    };
    return (
        <ThemedView style={styles.container}>
            <NetworkStatus />

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
            <View style={styles.card}>
                {/* Encabezado */}
                <View style={styles.cardHeader}>
                    <View
                        style={[
                            styles.statusContainer,
                            guide?.estado !== 'Pendiente' && { backgroundColor: '#DFF5E1' },
                        ]}
                    >
                        <Text
                            style={[
                                styles.status,
                                guide?.estado !== 'Pendiente' && { color: '#1F9144' },
                            ]}
                        >
                            {guide?.estado ?? 'Pendiente'}
                        </Text>
                    </View>
                </View>

                {/* Información del minimercado */}
                <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>{guide?.nombreCliente ?? ''}</Text>
                    <Text style={styles.documentNumber}>{guide?.codigoCliente ?? '0'}</Text>
                    <Text style={styles.address}>{cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}</Text>
                </View>

                {/* Línea divisoria */}
                <View style={styles.orderInfo}>

                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Método de pago</Text>
                        <Text style={styles.value}>Contra-Entrega</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>N° de factura</Text>
                        <Text style={styles.value}>{guide?.facturas[0]?.numeroFactura ?? '0'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>{'$ ' + (Number(guide?.facturas[0]?.valorTotal) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Descuento financiero</Text>
                        <Text style={[styles.value, { color: '#1F9144' }]}>
                            {'$ - ' + Number(guide?.facturas[0]?.dfr).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.labelTotal}>Total</Text>
                        <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                            {'$ ' + Number(guide?.facturas[0]?.valorRecaudar).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                    </View>

                    <View style={styles.dividerTwo} />

                    {/* Información del pedido */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Valor recaudado</Text>
                        <Text style={styles.value}>{'$ ' + Number(guide?.facturas[0]?.valorTotal).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.labelTotal}>Valor a recaudar</Text>
                        <Text style={[styles.value, { color: '#C62828', fontWeight: '800' }]}>
                            {'$ ' + (Number(guide?.facturas[0]?.valorRecaudar) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.qrButton} onPress={() => { validateButton(), setShowDetailInvoiceQR(true) }}>
                        <View style={styles.qrButtonContent}>
                            <Image
                                source={require('@/assets/icons/GenerateQR.png')}
                                style={styles.qrButtonIcon}
                            />
                            <Text style={styles.qrButtonText}>Generar QR de pago</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.qrButtonDetail} onPress={() => { validateButton(), setShowPayment(true) }}>
                        <Text style={styles.qrButtonText}>Detalle de pagos</Text>
                    </TouchableOpacity>

                </View>
            </View>
            <View style={styles.headerContainerTwo}>
                <Text style={styles.headerTitleTWO}>Estado de entrega</Text>
            </View>
            <View style={{ height: 200 }}>
                <DeliveryStatus
                    onStatusChange={(status) => console.log('Estado seleccionado:', status)}
                />
            </View>
 
            <View style={[styles.footer, { marginBottom: 10 }]}>
                <PrimaryButtonDetails
                    key={routeStarted ? "cerrar" : "llegue"}
                    title={routeStarted ? "Cerrar pedido" : "Ya llegué"}
                    onPress={routeStarted ? submitData : handleSubmit}
                    disabled={!isValid}
                    width={328}
                    height={43}
                    buttonColor={routeStarted ? "#DDDFE8" : undefined}
                    buttonColorEnd={routeStarted ? "#DDDFE8" : undefined}
                    titleColor={routeStarted ? "#FFFFFF" : undefined}
                    circleColor={routeStarted ? "#788095" : undefined}
                />

            </View>
            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={modalButtonLabel}
            />
            {(showPayment && routeStarted) && (
                <InfoPayments
                    title="Detalle de pagos"
                    subTitle="La factura no tiene pagos registrados"
                    description="Los pagos asociados a esta factura aparecerán aquí"
                    onClose={() => setShowPayment(false)}
                    width={width}
                />

            )}
            {(showDetailInvoiceQR && routeStarted) && (
                <DetailsInvoiceQR
                    data={guide}
                    onClose={() => setShowDetailInvoiceQR(false)}
                    onChangePhone={() => {
                        setShowDetailInvoiceQR(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    onGenerateQR={handleGenerateQR}


                />
            )}

            {modalgenerateQR && (
                <ViewQrModal
                    data={guide}
                    onClose={() =>
                        setModalgenerateQR(false)
                    }
                    onChangePhone={() => {
                        setShowDetailInvoiceQR(false);
                        setShowPayment(false);
                        setShowChangePhone(true);
                    }}
                    width={width}
                    phone={phone}
                    qrData={qrBase64}
                    qrType={qrType}
                    onChangeQRType={() => {
                        setShowDetailInvoiceQR(true);
                        setModalgenerateQR(false);
                    }}
                    onSendWhatsApp={handlSendWhatsApp}

                />
            )}

            <ChangePhoneModal
                visible={showChangePhone}
                onClose={() => setShowChangePhone(false)}
                onConfirm={(newPhone) => {
                    setPhone(newPhone);
                    setShowChangePhone(false);
                    setShowDetailInvoiceQR(true);
                }}
                onAlert={() => {
                    setTimeout(() => {
                        setShowSuccess(true);
                    }, 100);
                }}
            />

            {showSuccess && (
                <TopSuccessAlert
                    visible={showSuccess}
                    message="Número de teléfono actualizado"
                    onHide={() => setShowSuccess(false)}
                />
            )}

            {showSuccessQRp && (
                <TopSuccessAlert
                    visible={showSuccessQRp}
                    message="Envió exitoso"
                    subtitle="Enviamos el QR de pago al número 2612152672"
                    onHide={() => setShowSuccessQRP(false)}
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
    card: {
        width: 360,
        minHeight: 368,
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
    cardHeader: {
        alignItems: 'center',
        marginBottom: 4,
    },
    merchantInfo: {
        alignItems: 'center',
        marginBottom: 0,
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
    },
    documentNumber: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontStyle: 'normal',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    address: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontStyle: 'normal',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
        marginVertical: 2,
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
        fontStyle: 'normal',
        fontSize: 12,
        color: '#141D32',
        flex: 1,
    },
    value: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontStyle: 'normal',
        fontSize: 12,
        color: '#141D32',
        textAlign: 'right',
    },
    labelTotal: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontStyle: 'normal',
        fontSize: 12,
        color: '#141D32',
        flex: 1,
    },
    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 12,
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
    qrButtonDetail: {
        height: 32,
        backgroundColor: '#fffffffc',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
    bottomSheet: {
        width: "100%",
        height: 237,
        backgroundColor: "#E8EEF9",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 16,
        padding: 8,
        backgroundColor: "#0E2B68",
        borderRadius: 8,
    },
    closeText: {
        color: "#fff",
        fontWeight: "bold",
    },
});