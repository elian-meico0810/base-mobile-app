import { AddEvidenceButton } from '@/components/inputs/AddEvidenceButton';
import { TypeDelivery } from '@/src/constants/GuideStates';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { DerliveryDocument } from '../../domain/invoices/InvoicesInterFace';

interface DeliveryStatusActionProps {
    onStatusChange?: (status: 'total' | 'parcial' | 'rechazo' | null) => void;
    EntryVisible?: boolean;
    onOpenRefusedModal?: () => void;
    onHandelSubmit?: () => void;
    onUploadPhoto?: () => void;
    isCompleted?: boolean;
    selectedStatus?: 'total' | 'parcial' | 'rechazo' | null;
    typeDerlivery: string | undefined;
    conceptDelivery?: DerliveryDocument | DerliveryDocument[] | null | undefined;
    containerWidth?: number;
    containerHeight?: number;
    isDocumentoMeico?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function DeliveryStatusAction({
    onStatusChange,
    EntryVisible,
    onOpenRefusedModal,
    onHandelSubmit,
    onUploadPhoto,
    isCompleted = false,
    selectedStatus: externalStatus,
    typeDerlivery,
    conceptDelivery,
    // Valores por defecto para las dimensiones
    containerWidth = 350,
    containerHeight = 81,
    isDocumentoMeico
}: DeliveryStatusActionProps) {
    const [internalStatus, setInternalStatus] = useState<'total' | 'parcial' | 'rechazo' | null>(null);
    const selectedStatus = externalStatus !== undefined ? externalStatus : internalStatus;

    const handleStatusSelect = (status: 'total' | 'parcial' | 'rechazo') => {
        if (!EntryVisible) return;

        if (status === 'rechazo') {
            onOpenRefusedModal?.();
            console.log('Rechazo seleccionado');
        }
        const newStatus = status;

        // Actualizar estado interno solo si no hay estado externo
        if (externalStatus === undefined) {
            setInternalStatus(newStatus);
        }

        onStatusChange?.(newStatus);
    };

    // Crear estilos dinámicos basados en las props
    const dynamicStyles = StyleSheet.create({
        checkboxContainer: {
            width: containerWidth,
            minHeight: containerHeight,
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
    });
    const isInvalidDelivery = [
        TypeDelivery.RECHAZADO,
        TypeDelivery.ENT_PARCIAL,
        TypeDelivery.ENT_TOTAL,
    ].includes(typeDerlivery as TypeDelivery);

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Entrega total */}

            {isInvalidDelivery ? (
                <AddEvidenceButton
                    title="Evidencias cargadas"
                    backgroundColor="#EAF7ED"
                    textColor="#1F9144"
                    iconColor="#1F9144"
                    onPress={onUploadPhoto}
                    showEndIcon={true}
                    spaced={true}
                    width={360}
                    height={33}
                />
            ) : null
            }

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
    completedMessage: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#D1FAE5',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.5,
        pointerEvents: 'none'
    },

});