import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeliveryStatusProps {
    onStatusChange?: (status: 'total' | 'parcial' | null) => void;
}

export function DeliveryStatus({ onStatusChange }: DeliveryStatusProps) {
    const [selectedStatus, setSelectedStatus] = useState<'total' | 'parcial' | null>(null);

    const handleStatusSelect = (status: 'total' | 'parcial') => {
        const newStatus = selectedStatus === status ? null : status;
        setSelectedStatus(newStatus);
        onStatusChange?.(newStatus);
    };

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
        >
            {/* Checkbox Entrega total */}
            <TouchableOpacity
                style={[
                    styles.checkboxContainer,
                    selectedStatus === 'total' && styles.checkboxSelected
                ]}
                onPress={() => handleStatusSelect('total')}
            >
                <View style={styles.checkboxContent}>
                    {/* Ícono a la izquierda */}
                    <View style={styles.iconLeft}>
                        <View style={[
                            styles.iconContainer,
                            selectedStatus === 'total' && styles.iconContainerSelected
                        ]}>
                            <Image
                                source={require('@/assets/icons/Check.png')}
                                style={[
                                    styles.icon,
                                    selectedStatus === 'total' && styles.iconSelected
                                ]}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Texto en el centro */}
                    <View style={styles.textContent}>
                        <Text style={styles.checkboxLabel}>Entrega total</Text>
                        <Text style={styles.checkboxDescription}>
                            Todos los productos fueron recibidos correctamente.
                        </Text>
                    </View>

                    {/* Checkbox circular a la derecha */}
                    <View style={styles.checkboxRight}>
                        <View style={styles.checkbox}>
                            {selectedStatus === 'total' && (
                                <View style={styles.checkboxInner} />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Checkbox Entrega parcial */}
            <TouchableOpacity
                style={[
                    styles.checkboxContainer,
                    selectedStatus === 'parcial' && styles.checkboxSelected
                ]}
                onPress={() => handleStatusSelect('parcial')}
            >
                <View style={styles.checkboxContent}>
                    {/* Ícono a la izquierda */}
                    <View style={styles.iconLeft}>
                        <View style={[
                            styles.iconContainer,
                            selectedStatus === 'parcial' && styles.iconContainerSelected
                        ]}>
                            <Image
                                source={require('@/assets/icons/Warning.png')}
                                style={[
                                    styles.icon,
                                    selectedStatus === 'parcial' && styles.iconSelected
                                ]}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Texto en el centro */}
                    <View style={styles.textContent}>
                        <Text style={styles.checkboxLabel}>Entrega parcial</Text>
                        <Text style={styles.checkboxDescription}>
                            Algunos productos de la orden no fueron entregados.
                        </Text>
                    </View>

                    {/* Checkbox circular a la derecha */}
                    <View style={styles.checkboxRight}>
                        <View style={styles.checkbox}>
                            {selectedStatus === 'parcial' && (
                                <View style={styles.checkboxInner} />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        gap: 12,
        paddingVertical: 8,
    },
    checkboxContainer: {
        width: 350,
        minHeight: 81,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 16,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 16,
    },
    checkboxSelected: {
        borderColor: '#4F74C4',
        backgroundColor: '#F8F9FF',
    },
    checkboxContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flex: 1,
    },
    iconLeft: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F1F5',
    },
    iconContainerSelected: {
        backgroundColor: '#4F74C4',
        borderColor: '#4F74C4',
    },
    icon: {
        width: 16,
        height: 16,
        tintColor: '#666666', // Color gris por defecto
    },
    iconSelected: {
        tintColor: '#FFFFFF', // Color blanco cuando está seleccionado (sobre fondo azul)
    },
    textContent: {
        flex: 1,
        marginRight: 12,
    },
    checkboxRight: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#4F74C4',
        borderRadius: 6,
    },
    checkboxLabel: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#141D32',
        marginBottom: 4,
    },
    checkboxDescription: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 12,
        color: '#788095',
    },
});