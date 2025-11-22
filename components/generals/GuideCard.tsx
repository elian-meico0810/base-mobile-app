import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GuideCardProps {
    guide: GuideDetails;
    onPress?: () => void;
}

export function GuideCard({ guide, onPress }: GuideCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                        {guide.nombreCliente}
                    </Text>
                    <Text style={styles.code}>{guide.codigoCliente}</Text>
                </View>

                <View style={styles.statusContainer}>
                    <Text style={styles.status}>{guide.estado}</Text>
                </View>
            </View>

            <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.address}>{guide.direccion}, {guide.poblacion}</Text>
            </View>

            <View style={styles.addressContainer}>
                <Ionicons name="cube-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
                <Text style={styles.orders}>{guide.count ?? 0} {"Ordenes"}</Text>
            </View>
            <TouchableOpacity style={styles.gotoButton} onPress={onPress} activeOpacity={0.8}>
                <View style={styles.gotoContent}>
                    <Text style={styles.gotoText}>Ir a la dirección</Text>
                    <Image
                        source={require('@/assets/icons/Direction.png')}
                        style={styles.gotoIcon}
                    />
                </View>
            </TouchableOpacity>


        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 328,
        height: 167,
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
