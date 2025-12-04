import { AddEvidenceButton } from '@/components/inputs/AddEvidenceButton';
import { TypeDelivery } from '@/src/constants/GuideStates';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeliveryStatusProps {
    onStatusChange?: (status: 'total' | 'parcial' | 'rechazo' | null) => void;
    EntryVisible?: boolean;
    onOpenRefusedModal?: () => void;
    onHandelSubmit?: () => void;
    onUploadPhoto?: () => void;
    isCompleted?: boolean; // ← NUEVO: para saber si está completado
    selectedStatus?: 'total' | 'parcial' | 'rechazo' | null;
    typeDerlivery: string | undefined;
}
const { width, height } = Dimensions.get('window');

export function DeliveryStatus({
    onStatusChange,
    EntryVisible,
    onOpenRefusedModal,
    onHandelSubmit,
    onUploadPhoto,
    isCompleted = false,
    selectedStatus: externalStatus,
    typeDerlivery
}: DeliveryStatusProps) {
    const [internalStatus, setInternalStatus] = useState<'total' | 'parcial' | 'rechazo' | null>(null);

    const selectedStatus = externalStatus !== undefined ? externalStatus : internalStatus;
    const handleStatusSelect = (status: 'total' | 'parcial' | 'rechazo') => {
        if (!EntryVisible) return;
        if (status === 'rechazo') {
            onOpenRefusedModal?.();
            console.log('Rechazo seleccionado');
        }
        const newStatus = selectedStatus === status ? null : status;

        // Actualizar estado interno solo si no hay estado externo
        if (externalStatus === undefined) {
            setInternalStatus(newStatus);
        }

        onStatusChange?.(newStatus);
    };

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Entrega total */}
            <TouchableOpacity
                style={[
                    styles.checkboxContainer,
                    selectedStatus === 'total' && styles.checkboxSelected,
                    !EntryVisible && styles.disabled
                ]}
                onPress={() => handleStatusSelect('total')}
                disabled={!EntryVisible}
            >
                <View style={styles.checkboxContent}>
                    {/* ICONO IZQUIERDO */}
                    <View style={styles.iconLeft}>
                        <View style={[
                            styles.iconContainer,
                        ]}>
                            <Image
                                source={require('@/assets/icons/Check.png')}
                                style={[
                                    styles.icon,
                                ]}
                            />
                        </View>
                    </View>

                    {/* TEXTO */}
                    <View style={styles.textContent}>
                        <Text style={[
                            styles.checkboxLabel,
                        ]}>Entrega total</Text>
                        <Text style={[
                            styles.checkboxDescription,
                        ]}>
                            Todos los productos fueron recibidos correctamente.
                        </Text>
                    </View>

                    {/* CHECK DERECHA */}
                    <View style={styles.checkboxRight}>
                        <View style={[
                            styles.checkbox,
                        ]}>
                            {selectedStatus === 'total' && (
                                <View style={[
                                    styles.checkboxInner,
                                ]} />
                            )}
                        </View>
                    </View>
                </View>

                {/* BOTÓN DE AGREGAR EVIDENCIA - SOLO SI NO ESTÁ COMPLETADO */}
                {TypeDelivery.ENT_TOTAL === typeDerlivery ? (
                    <AddEvidenceButton
                        title="Evidencias cargadas"
                        backgroundColor="#EAF7ED"
                        textColor="#1F9144"
                        iconColor="#1F9144"
                        onPress={onUploadPhoto}
                        showEndIcon={true}
                        spaced={true}
                    />
                ) : selectedStatus === 'total' ? (
                    <AddEvidenceButton
                        onPress={onUploadPhoto}
                    />
                ) : null
                }



            </TouchableOpacity>

            {/* Entrega parcial */}
            <TouchableOpacity
                style={[
                    styles.checkboxContainer,
                    selectedStatus === 'parcial' && styles.checkboxSelected,
                    !EntryVisible && styles.disabled
                ]}
                onPress={() => handleStatusSelect('parcial')}
                disabled={!EntryVisible}
            >
                <View style={styles.checkboxContent}>
                    <View style={styles.iconLeft}>
                        <View style={[
                            styles.iconContainer,
                        ]}>
                            <Image
                                source={require('@/assets/icons/Warning.png')}
                                style={[
                                    styles.icon,
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.textContent}>
                        <Text style={[
                            styles.checkboxLabel,
                        ]}>Entrega parcial</Text>
                        <Text style={[
                            styles.checkboxDescription,
                        ]}>
                            Algunos productos de la orden no fueron entregados.
                        </Text>
                    </View>

                    <View style={styles.checkboxRight}>
                        <View style={[
                            styles.checkbox,
                        ]}>
                            {selectedStatus === 'parcial' && (
                                <View style={[
                                    styles.checkboxInner,
                                ]} />
                            )}
                        </View>
                    </View>
                </View>

                {/* BOTÓN DE AGREGAR EVIDENCIA - SOLO SI NO ESTÁ COMPLETADO */}
                {TypeDelivery.ENT_PARCIAL === typeDerlivery ? (
                    <AddEvidenceButton
                        title="Evidencias cargadas"
                        backgroundColor="#EAF7ED"
                        textColor="#1F9144"
                        iconColor="#1F9144"
                        onPress={onUploadPhoto}
                        showEndIcon={true}
                        spaced={true}
                    />
                ) : selectedStatus === 'parcial' ? (
                    <AddEvidenceButton
                        onPress={onUploadPhoto}
                    />
                ) : null
                }



                {/* MENSAJE CUANDO ESTÁ COMPLETADO */}

            </TouchableOpacity>

            {/* Rechazo */}
            <TouchableOpacity
                style={[
                    styles.checkboxContainer,
                    selectedStatus === 'rechazo' && styles.checkboxSelected,
                    !EntryVisible && styles.disabled
                ]}
                onPress={() => handleStatusSelect('rechazo')}
                disabled={!EntryVisible} // ← Deshabilitar si está completado
            >
                <View style={styles.checkboxContent}>
                    <View style={styles.iconLeft}>
                        <View style={[
                            styles.iconContainer,
                        ]}>
                            <Image
                                source={require('@/assets/icons/Close.png')}
                                style={[
                                    styles.icon,
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.textContent}>
                        <Text style={[
                            styles.checkboxLabel,
                        ]}>Rechazo de entrega</Text>
                        <Text style={[
                            styles.checkboxDescription,
                        ]}>
                            El cliente no recibió ninguno de los productos.
                        </Text>
                    </View>

                    <View style={styles.checkboxRight}>
                        <View style={[
                            styles.checkbox,
                        ]}>
                            {selectedStatus === 'rechazo' && (
                                <View style={[
                                    styles.checkboxInner,
                                ]} />
                            )}
                        </View>
                    </View>
                </View>
                {TypeDelivery.RECHAZADO === typeDerlivery ? (
                    <AddEvidenceButton
                        title="Evidencias cargadas"
                        backgroundColor="#EAF7ED"
                        textColor="#1F9144"
                        iconColor="#1F9144"
                        onPress={onUploadPhoto}
                        showEndIcon={true}
                        spaced={true}
                    />
                ) :null
                }

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
        borderColor: '#164194',
    },
    completedMessage: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#D1FAE5',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    completedMessageText: {
        color: '#065F46',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    // ESTILOS EXISTENTES
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
    icon: {
        width: 16,
        height: 16,
        tintColor: '#666666',
    },
    textContent: {
        flex: 1,
        marginRight: 12,
    },
    checkboxRight: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
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
        backgroundColor: '#164194', // ← AZUL (antes de completar)
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
    disabled: {
        opacity: 0.5,
        pointerEvents: 'none'
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: "#F9F9FA",
        justifyContent: "center",
        alignItems: "center",
    },
});