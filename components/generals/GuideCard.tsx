import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { openChooser } from '@/src/utils/maps/openGoogleMapsByAddress';
import { cleanSpaces } from '@/src/utils/uitls';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ExceptionModal } from './ExecptionModal';

const { width, height } = Dimensions.get("window");

interface GuideCardProps {
    guide: GuideDetails;
    onPress?: () => void;
    routeStarted: boolean;
    numberGuide?: string;
    token?: string;
    statusValue?: string;
}

export function GuideCard({ guide, onPress, routeStarted, numberGuide, token, statusValue }: GuideCardProps) {
    const cleanAddress = `${cleanSpaces(guide.direccion)}, ${cleanSpaces(guide.poblacion)}`;
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const { width: windowWidth } = useWindowDimensions();
    
    const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
    
    const handleGoToMap = async () => {
        const lat = Number(guide.latitud);
        const lng = Number(guide.longitud);

        const hasCoords =
            lat !== undefined &&
            lng !== undefined &&
            lat !== 0 &&
            lng !== 0 &&
            !isNaN(lat) &&
            !isNaN(lng);

        if (!hasCoords) {
            setModalVisible(true);
            return;
        }

        openChooser(lat, lng);
    };
    
    return (
        <TouchableOpacity
            disabled={(!statusValue || (guide.estado !== 'Pendiente' && !guide.tieneNoEntrega)) ? true : false}
            style={[
                styles.card,
                (!statusValue || guide.estado !== 'Pendiente') && {
                    backgroundColor: '#F9F9FA',
                    opacity: 0.6,
                    borderColor: '#F9F9FA',
                    borderWidth: 1,
                }
            ]}
            activeOpacity={0.8}
            onPress={() => {
                onPress?.();
                if (!routeStarted) return;
            }}
        >
            {guide.tieneNoEntrega && (
                <View style={styles.noDeliveryTag}>
                    <Ionicons name="alert-circle" size={isTablet ? 16 : 14} color="#164194" />
                    <Text style={[styles.noDeliveryText, isTablet && styles.noDeliveryTextTablet]}>{String(guide?.causalNoEntrega ?? '')}</Text>
                </View>
            )}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, isTablet && styles.nameTablet]} numberOfLines={2} ellipsizeMode="tail">
                        {guide.nombreCliente}
                    </Text>
                    <Text style={[styles.code, isTablet && styles.codeTablet]}>{guide.codigoCliente}</Text>
                </View>

                <View
                    style={[
                        styles.statusContainer,
                        guide.estado !== 'Pendiente' && { backgroundColor: '#DFF5E1' }
                    ]}
                >
                    <Text
                        style={[
                            styles.status,
                            guide.estado !== 'Pendiente' && { color: '#1F9144' }
                        ]}
                    >
                        {guide.estado}
                    </Text>
                </View>
            </View>

            <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={isTablet ? 18 : 16} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={[styles.address, isTablet && styles.addressTablet]}>{cleanAddress}</Text>
            </View>

            <View style={styles.addressContainer}>
                <Ionicons name="cube-outline" size={isTablet ? 18 : 16} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={[styles.orders, isTablet && styles.ordersTablet]}>
                    {guide.facturas?.length ?? 0} Ordenes
                </Text>
            </View>
            
            {guide.estado === 'Pendiente' && (
                <TouchableOpacity
                    style={styles.gotoButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (!routeStarted) {
                            setModalVisible(true);
                            return;
                        }
                        handleGoToMap();
                    }}
                >
                    <View style={styles.gotoContent}>
                        <Text style={[styles.gotoText, isTablet && styles.gotoTextTablet]}>Ir a la dirección</Text>
                        <Image source={require('@/assets/icons/Direction.png')} style={[styles.gotoIcon, isTablet && styles.gotoIconTablet]} />
                    </View>
                </TouchableOpacity>
            )}

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={routeStarted ? "Sin ubicación disponible" : "¡Alerta!"}
                message={
                    (routeStarted)
                        ? "Esta dirección no contiene coordenadas válidas para navegar."
                        : "Debe comenzar ruta para realizar esta acción."
                }
                buttonLabel="Entendido"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: width * 0.9,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderColor: '#F0F1F5',
        padding: 12,
        marginBottom: 16,
        justifyContent: 'flex-start',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 17,
        color: '#000',
        flexWrap: 'wrap',
        marginBottom: 2,
        flex: 1,
    },
    nameTablet: {
        fontSize: 18,
        lineHeight: 22,
    },
    statusContainer: {
        backgroundColor: '#E8EEF9',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: 78,
        height: 31,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 22,
        color: '#4F74C4',
    },
    code: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 12,
        color: '#141D32',
        marginTop: 2,
    },
    codeTablet: {
        fontSize: 14,
        lineHeight: 16,
    },
    address: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        flexShrink: 1,
        flexWrap: 'wrap',
        flex: 1,
    },
    addressTablet: {
        fontSize: 14,
    },
    orders: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    ordersTablet: {
        fontSize: 14,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    gotoButton: {
        width: '100%',
        height: 32,
        borderRadius: 64,
        borderWidth: 1,
        borderColor: '#164194',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 12,
    },
    gotoText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#164194',
    },
    gotoTextTablet: {
        fontSize: 16,
    },
    iconBox: {
        width: 32,
        height: 32,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginRight: 4,
    },
    gotoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gotoIcon: {
        width: 11.75,
        height: 15,
        tintColor: '#164194',
        marginLeft: 5,
    },
    gotoIconTablet: {
        width: 14,
        height: 18,
    },
    noDeliveryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8EEF9',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 8,
    },
    noDeliveryText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#4F74C4',
        marginLeft: 4,
    },
    noDeliveryTextTablet: {
        fontSize: 14,
    },
});