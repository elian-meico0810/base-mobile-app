import { TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { capitalizeFirst } from '@/src/utils/uitls';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GuideDetails } from '../../domain/details/DetailsGuide';
import { DerliveryDocument } from '../../domain/invoices/InvoicesInterFace';
import { DeliveryStatus } from './DeliveryStatus';

interface OneSelectedOrderProps {
    data?: GuideDetails[] | undefined;
    conceptDelivery?: DerliveryDocument | DerliveryDocument[] | null;
    onSelectionChange?: (isSelected: boolean, selectedData: GuideDetails[]) => void;
    uploadPhoto?: () => void;
    onOpenRefusedModal?: () => void;
    onStatusChange?: (status: "total" | "parcial" | "rechazo" | null) => void;
    selectedStatus?: "total" | "parcial" | "rechazo" | null;
    setShowStatusDelivery?: (status: "total" | "parcial" | "rechazo" | null) => void;

}

const { width, height } = Dimensions.get('window');


const OneSelectedOrder: React.FC<OneSelectedOrderProps> = ({
    data = [],
    conceptDelivery,
    onSelectionChange,
    uploadPhoto,
    onOpenRefusedModal,
    onStatusChange,
    selectedStatus,
    setShowStatusDelivery,
}) => {
    const [selectedMultipleInvoices, setSelectedMultipleInvoices] = useState<GuideDetails[]>([]);
    const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
    const [isInvoiceSelected, setIsInvoiceSelected] = useState<boolean>(false);
    useEffect(() => {
        if (data && data.length > 0) {
            const primeraPosicion = data[0];
            setSelectedMultipleInvoices([primeraPosicion]);
            if (onSelectionChange) {
                onSelectionChange(true, [primeraPosicion]);
                setIsInvoiceSelected(true);
            }
        }
    }, [data]);

    const handleCheckboxPress = () => {
        const newSelectionState = !isInvoiceSelected;
        setIsInvoiceSelected(newSelectionState);

        if (onSelectionChange) {
            onSelectionChange(newSelectionState, newSelectionState ? selectedMultipleInvoices : []);
        }

        if (newSelectionState) {
        }
    };

    if (selectedMultipleInvoices.length === 0) {
        return (
            <View style={styles.container}>
                <Text>Cargando información...</Text>
            </View>
        );
    }
    const invoice = selectedMultipleInvoices[0];
    const invoiceOne = invoice.facturas[0];

    const hasEvidence = (numeroFactura: string): boolean => {
        if (Array.isArray(conceptDelivery)) {
            return conceptDelivery.some(
                (doc) => String(doc.documentMeico) === String(numeroFactura)
            );
        }
        return false;
    };
    const handleStatusChange = (status: "total" | "parcial" | "rechazo" | null) => {
        setShowStatusDelivery?.(status);

        // Enviar al padre si existe la prop
        if (onStatusChange) {
            onStatusChange(status);
        }
    };
    const firstItem = Array.isArray(conceptDelivery)
        ? conceptDelivery
        : conceptDelivery ?? null;

    const hasDeliveryMatch =
        Array.isArray(firstItem) &&
        firstItem.some(item => item.documentMeico === invoiceOne.numeroFactura);

    const matchedDelivery = Array.isArray(conceptDelivery)
        ? conceptDelivery.find(item => item.documentMeico === invoiceOne.numeroFactura)
        : conceptDelivery?.documentMeico === invoiceOne.numeroFactura
            ? conceptDelivery
            : undefined;

    const typeDerlivery = matchedDelivery?.tipoEntrega?.codigo;

    var value = '';
    switch (invoiceOne?.tipo) {
        case TypeInvoiceEnum.CONTADO_EFECTIVO:
            value = 'Contra-entrega';
            break;

        case TypeInvoiceEnum.CREDITO:
            value = 'Credito';
            break;

        case TypeInvoiceEnum.ANTICIPO:
            value = 'Anticipado';
            break;
    }


    return (
        <View style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={[styles.checkbox, isInvoiceSelected && styles.checkboxSelected]}
                            onPress={handleCheckboxPress}
                        >
                            {isInvoiceSelected && (
                                <Text style={styles.checkboxIcon}>✓</Text>
                            )}
                        </TouchableOpacity>
                        <View style={styles.contentContainer}>
                            {/* Estado */}
                            <View style={styles.statusContainer}>
                                <Text style={styles.status}>
                                    {capitalizeFirst(invoice?.estado)}
                                </Text>
                            </View>

                            {/* Order + Valor */}
                            <View style={styles.infoRow}>
                                <Text style={styles.orderText} numberOfLines={1} ellipsizeMode="tail">
                                    Factura n° {invoiceOne?.numeroFactura || '00000'}
                                </Text>

                                <Text style={styles.amountText}>
                                    {capitalizeFirst(value)}
                                </Text>
                            </View>

                            {/* Tipo de factura */}
                            <Text style={styles.codText} numberOfLines={1} ellipsizeMode="tail">
                                {capitalizeFirst(value)}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <DeliveryStatus
                        onStatusChange={handleStatusChange}
                        EntryVisible={true}
                        onOpenRefusedModal={() => onOpenRefusedModal?.()}
                        onUploadPhoto={() => {
                            uploadPhoto?.();
                        }}
                        isCompleted={isDeliveryCompleted}
                        selectedStatus={selectedStatus}
                        conceptDelivery={conceptDelivery}
                        typeDerlivery={typeDerlivery}
                        
                    />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    container: {
        width: '92%', // Cambiado de 340 fijo
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F1F5',
        backgroundColor: '#FFFFFF',
        opacity: 1,
        alignSelf: 'center',
        marginHorizontal: 16, 
    },
    header: {
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        width: '100%',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#DDDFE8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        flexShrink: 0, // Evita que el checkbox se encoja
    },
    checkboxSelected: {
        backgroundColor: '#164194',
        borderColor: '#164194',
    },
    checkboxIcon: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8EEF9',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#4F74C4',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 10,
        minWidth: 0, // Permite que el contenido se ajuste
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap', // Permite wrap en pantallas pequeñas
        gap: 4, // Espacio entre elementos
    },
    orderText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#141D32',
        flex: 1, // Ocupa el espacio disponible
        marginRight: 8,
        minWidth: 100, // Ancho mínimo para el texto
    },
    amountText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '800',
        color: '#141D32',
        lineHeight: 16,
        flexShrink: 0, // Evita que el precio se encoja
    },
    codText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 14,
        color: '#788095',
        marginTop: 8,
        flexWrap: 'wrap',
        flex: 1,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flexShrink: 0,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
});
export default OneSelectedOrder;