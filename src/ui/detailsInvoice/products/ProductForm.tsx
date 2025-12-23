import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { LoadingSunburst } from '@/components/generals/LoadingSunburst';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { ThemedView } from '@/components/themed-view';
import { ProductValidationSection } from '@/src/features/detailsInvoice/products/ProductValidationScreen';
import { DeliveryStatus } from '@/src/features/tracking/components/checkbox/DeliveryStatus';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { capitalizeFirst, cleanSpaces } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

interface ProductFormFormProps {
    initialGuide?: GuideDetails;
    token?: string;
    onSubmit: (params: { guide: GuideDetails; token: string }) => void | Promise<void>;
    numberGuide?: number;
    isSelectInvocies?: string;
    documentMeico?: string;
    isCountryDelivery?: boolean;
    IsGoBack?: boolean;
    routeStartedBotton?: string;
}

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

type DeliveryStatus = "total" | "parcial" | "rechazo" | null;
type OptionsRefusedPorps = 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null;

export function ProductForm({ initialGuide, token = "", onSubmit, numberGuide, isSelectInvocies, documentMeico, isCountryDelivery = false, IsGoBack = false, routeStartedBotton }: ProductFormFormProps) {
    const [guide, setGuide] = useState<GuideDetails | undefined>(initialGuide);
    const [loading, setLoading] = useState(false);
    const [routeStarted, setRouteStarted] = useState(routeStartedBotton ? true : false);
    const [refreshing, setRefreshing] = useState(false);
    const [RefreshingOnPress, setRefreshingOnPress] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [statusValue, setStatusValue] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const router = useRouter();
    const handleGoBack = () => {
        if (routeStarted && isCountryDelivery) {
            router.push(
                `/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
            );
        } else {
            router.back();
        }
    };

    // Funciones para expandir/recoger
    const handleExpand = () => setIsExpanded(true);
    const handleCollapse = () => setIsExpanded(false);


    const handleSubmitData = async () => {
        try {
            // setLoading(true);
            console.log("llego aca handleSubmitData");


            setLoading(false);
        } catch (error: any) {
            setModalTitle("¡Error!");
            setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    }
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
            {(refreshing && RefreshingOnPress) && <LoadingSunburst />}

            {/* Card blanco centrado */}
            <View style={[
                styles.card,
                !isExpanded && styles.cardCollapsed
            ]}>
                <View style={styles.headerRow}>
                    <Text style={styles.merchantName}>{capitalizeFirst(guide?.nombreCliente) ?? ''}</Text>

                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={isExpanded ? handleCollapse : handleExpand}
                    >
                        <View style={styles.arrowsContainer}>
                            {/* Icono superior */}
                            <Image
                                source={require('@/assets/icons/ReboackPage.png')}

                                style={[
                                    styles.reboackIcon,
                                ]}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Contenido expandido */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.address}>{cleanSpaces(guide?.direccion)}, {cleanSpaces(guide?.poblacion)}</Text>

                        {/* Botones de Rechazar todo y Aceptar todo */}
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={handleSubmitData}
                            >
                                <MaterialIcons name="close" size={16} color="#C62828" />
                                <Text style={styles.rejectButtonText}> Rechazar todo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={handleSubmitData}
                            >
                                <MaterialIcons name="check" size={16} color="#1F9144" />
                                <Text style={styles.acceptButtonText}> Aceptar todo</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                )}
            </View>
            {/** Listado de productos */}
            <ProductValidationSection />

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
    headerTSubitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 18,
        color: '#000',
        textAlign: 'left',
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
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 12,
        shadowColor: "#000",
        marginTop: 1,
        minHeight: 49,
    },
    cardCollapsed: {
        height: 49,
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#141D32',
        flex: 1,
        textAlign: 'center',
    },
    expandButton: {
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#D1D3D8',
    },
    expandButtonText: {
        fontSize: 16,
        color: '#141D32',
        fontWeight: 'bold',
    },
    expandedContent: {
        gap: 8,
    },
    address: {
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: '#141D32',
        textAlign: 'center',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    rejectButton: {
        width: 160,
        height: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C62828',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    rejectButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#C62828',
    },
    acceptButton: {
        width: 160,
        height: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1F9144',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    acceptButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F9144',
    },
    arrowsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
    },
    subtitleContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 10,
        alignItems: 'flex-start',
    },
    reboackIcon: {
        width: 12,
        height: 12,
    },
});