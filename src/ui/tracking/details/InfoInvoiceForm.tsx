import { PrimaryButtonDetails } from '@/components/buttons/PrimaryButtonDetails';
import { DeliveryStatus } from '@/components/checkbox/DeliveryStatus';
import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { ThemedView } from '@/components/themed-view';
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
    const isValid = true;

    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };
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
                        <Text style={styles.value}>123456789</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>{'$ ' + (Number(30000) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Descuento financiero</Text>
                        <Text style={[styles.value, { color: '#1F9144' }]}>
                            {'$ - ' + Number(4500).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.labelTotal}>Total</Text>
                        <Text style={[styles.value, { color: '#141D32', fontWeight: '800' }]}>
                            {'$ ' + Number(25500).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                    </View>

                    <View style={styles.dividerTwo} />

                    {/* Información del pedido */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Valor recaudado</Text>
                        <Text style={styles.value}>{'$ ' + Number(0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.labelTotal}>Valor a recaudar</Text>
                        <Text style={[styles.value, { color: '#C62828', fontWeight: '800' }]}>
                            {'$ ' + (Number(25500) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.qrButton} onPress={() => console.log('Generar QR de pago')}>
                        <View style={styles.qrButtonContent}>
                            <Image
                                source={require('@/assets/icons/GenerateQR.png')}
                                style={styles.qrButtonIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.qrButtonText}>Generar QR de pago</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.qrButtonDetail} onPress={() => console.log('Generar QR de pago')}>
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

            <View style={styles.footer}>
                <PrimaryButtonDetails
                    title="Ya llegue"
                    onPress={handleSubmit}
                    disabled={!isValid}
                    width={328}
                    height={44}
                />
            </View>
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
        position: 'relative',
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
});