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
                            <View style={[
                                styles.statusContainer,
                            ]}>
                                <Text style={[
                                    styles.status,
                                ]}>{hasEvidence(invoiceOne.numeroFactura) ? "Entregado" : "Pendiente"}</Text>
                            </View>

                            {/* Order + Valor + Flecha */}
                            <View style={styles.rowBetween}>
                                <Text style={styles.orderText}>
                                    Factura n° {invoiceOne.numeroFactura || '00000'}
                                </Text>

                                <View style={styles.priceRow}>
                                    <Text style={styles.amountText}>
                                        {invoiceOne?.tipo === "CONTADO EFECTIVO" ? "Contra-entrega" : "Crédito"}
                                    </Text>

                                </View>
                            </View>

                            {/* Tipo de factura */}
                            <Text style={styles.codText} numberOfLines={1} ellipsizeMode="tail">
                                {invoiceOne?.tipo === "CONTADO EFECTIVO" ? "Contra-entrega" : "Crédito"}
                            </Text>

                        </View>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
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
                        containerWidth={300}
                    />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    container: {
        width: 340,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F1F5',
        backgroundColor: '#FFFFFF',
        opacity: 1,
    },
    header: {
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
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
    codText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 14,
        color: '#788095',
        marginTop: 8,
        flexWrap: 'wrap',
    },
    amountText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '800',
        color: '#141D32',
        lineHeight: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#141D32',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    contentContainer: {
        flex: 1,
        marginLeft: 10,
    },
});

export default OneSelectedOrder;