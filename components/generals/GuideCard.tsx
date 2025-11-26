import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { openChooser } from '@/src/utils/maps/openGoogleMapsByAddress';
import { cleanSpaces } from '@/src/utils/uitls';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExceptionModal } from './ExecptionModal';

interface GuideCardProps {
    guide: GuideDetails;
    onPress?: () => void;
    routeStarted: boolean;
    numberGuide?: string
    token?: string

}

export function GuideCard({ guide, onPress, routeStarted, numberGuide, token }: GuideCardProps) {
    const cleanAddress = `${cleanSpaces(guide.direccion)}, ${cleanSpaces(guide.poblacion)}`;
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
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
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
                if (!routeStarted) return;
                // Navegar a la vista de detalles de la guía
                router.push(
                    `/views/indexInvoice?guide=${encodeURIComponent(JSON.stringify(guide))}&numberGuide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`
                );
            }}
        >
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                        {guide.nombreCliente}
                    </Text>
                    <Text style={styles.code}>{guide.codigoCliente}</Text>
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
                <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.address}>{cleanAddress}</Text>
            </View>

            <View style={styles.addressContainer}>
                <Ionicons name="cube-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.orders}>
                    {guide.facturas?.length ?? 0} Ordenes
                </Text>
            </View>
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
                    <Text style={styles.gotoText}>Ir a la dirección</Text>
                    <Image source={require('@/assets/icons/Direction.png')} style={styles.gotoIcon} />
                </View>
            </TouchableOpacity>

            <ExceptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={routeStarted ? "Sin ubicación disponible" : "Alerta !!"}
                message={
                    routeStarted
                        ? "Esta guía no contiene coordenadas válidas para navegar."
                        : "Debe comenzar ruta para realizar esta acción."
                }
                buttonLabel="Entendido"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 328,
        height: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F1F5',
        padding: 12,
        marginBottom: 16,
        justifyContent: 'flex-start',
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
        maxWidth: 215,
        marginBottom: 2,
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
    },

    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 12,
        lineHeight: 22,
        color: '#4F74C4',
    },
    code: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 12,
        lineHeight: 12,
        color: '#141D32',
        marginTop: 2,
    },
    address: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    orders: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    gotoButton: {
        width: 303,
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
        marginLeft: 5
    },
});
