import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { ThemedView } from '@/components/themed-view';
import { TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { cleanSpaces } from '@/src/utils/uitls';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface ViewDefaultProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type DeliveryStatus = "total" | "parcial" | "rechazo" | null;
type OptionsRefusedPorps = 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null;

export function ViewDefault({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico }: ViewDefaultProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

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

        case TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO:
            value = 'Aplicativo-meico';
            break;
    }

    const handleGoBack = async () => {
        router.push(
            `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
        );
    };

    const isSmallScreen = height <= 780;

    return (
        <ThemedView style={styles.container}>
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
                    <View style={styles.statusContainer}>
                        <Text style={styles.status}>{'Pendiente'}</Text>
                    </View>
                </View>

                {/* Información del minimercado */}
                <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>{guide?.nombreCliente ?? ''}</Text>
                    <Text style={styles.documentNumber}>{guide?.codigoCliente ?? '0'}</Text>
                    <Text style={styles.address}>{cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}</Text>
                </View>

            </View>

            <View style={styles.headerContainerTwo}>
                <Text style={styles.headerTitleTWO}>Estado de entrega</Text>
            </View>

            {/* MENSAJE DE SOPORTE - VISTO SIEMPRE */}
            <View style={styles.supportMessageContainer}>
                <Text style={styles.supportMessageTitle}>
                    Configuración no contemplada
                </Text>
                <Text style={styles.supportMessageText}>
                    Esta dirección tiene una combinación de facturas que no está contemplada en el sistema.
                </Text>
                <Text style={styles.supportContactText}>
                    Por favor, contacta al CEDI para reportar la novedad.
                </Text>
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
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    address: {
        fontFamily: 'Rubik',
        fontWeight: '600',
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
        fontSize: 12,
        color: '#141D32',
        flex: 1,
    },
    value: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        color: '#141D32',
        textAlign: 'right',
    },
    labelTotal: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 12,
        color: '#141D32',
        flex: 1,
    },
    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
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
    // Estilos para el mensaje de soporte
    supportMessageContainer: {
        width: '90%',
        backgroundColor: '#FFF3CD',
        borderColor: '#FFEeba',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginTop: 20,
        alignSelf: 'center',
    },
    supportMessageTitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 16,
        color: '#856404',
        textAlign: 'center',
        marginBottom: 8,
    },
    supportMessageText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
        marginBottom: 12,
    },
    supportContactText: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
        marginBottom: 12,
    },
    supportInfoBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    supportInfoText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
    },
});