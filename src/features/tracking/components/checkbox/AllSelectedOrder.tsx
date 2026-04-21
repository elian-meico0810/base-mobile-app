import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { GuideDetails } from '../../domain/details/DetailsGuide';
import { DerliveryDocument } from '../../domain/invoices/InvoicesInterFace';
import { DeliveryStatus } from './DeliveryStatus';

interface AllSelectedOrderProps {
    data?: GuideDetails[] | undefined;
    conceptDelivery?: DerliveryDocument | DerliveryDocument[] | null;
    onSelectionChange?: (isSelected: boolean, selectedData: GuideDetails[]) => void;
    uploadPhoto?: () => void;
    onOpenRefusedModal?: () => void;
    onStatusChange?: (status: "total" | "parcial" | "rechazo" | null) => void;
    selectedStatus?: "total" | "parcial" | "rechazo" | null;
    setShowStatusDelivery?: (status: "total" | "parcial" | "rechazo" | null) => void;
}

const AllSelectedOrder: React.FC<AllSelectedOrderProps> = ({
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
            // CAMBIO: Usar for para agregar todos los elementos
            const allInvoices: GuideDetails[] = [];
            for (let i = 0; i < data.length; i++) {
                allInvoices.push(data[i]);
            }
            
            setSelectedMultipleInvoices(allInvoices);
            if (onSelectionChange) {
                onSelectionChange(true, allInvoices);
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

    // CAMBIO: Usar for para verificar todas las facturas
    let hasAnyDeliveryMatch = false;
    let matchedDelivery = undefined;
    
    for (let i = 0; i < selectedMultipleInvoices.length; i++) {
        const invoice = selectedMultipleInvoices[i];
        
        // Verificar cada factura dentro del invoice
        for (let j = 0; j < invoice.facturas.length; j++) {
            const invoiceOne = invoice.facturas[j];
            
            const hasEvidence = (numeroFactura: string): boolean => {
                if (Array.isArray(conceptDelivery)) {
                    return conceptDelivery.some(
                        (doc) => String(doc.documentMeico) === String(numeroFactura)
                    );
                }
                return false;
            };
            
            const firstItem = Array.isArray(conceptDelivery)
                ? conceptDelivery
                : conceptDelivery ?? null;

            const hasDeliveryMatch =
                Array.isArray(firstItem) &&
                firstItem.some(item => item.documentMeico === invoiceOne.numeroFactura);

            if (hasDeliveryMatch) {
                hasAnyDeliveryMatch = true;
                
                if (Array.isArray(conceptDelivery)) {
                    matchedDelivery = conceptDelivery.find(item => item.documentMeico === invoiceOne.numeroFactura);
                } else if (conceptDelivery?.documentMeico === invoiceOne.numeroFactura) {
                    matchedDelivery = conceptDelivery;
                }
                
                // Si encontramos un match, podemos salir del bucle interno
                break;
            }
        }
        
        // Si ya encontramos un match, podemos salir del bucle externo
        if (hasAnyDeliveryMatch) {
            break;
        }
    }

    const typeDerlivery = matchedDelivery?.tipoEntrega?.codigo;

    // CAMBIO: Verificar si todas las entregas están completadas usando for
    let allCompleted = true;
    for (let i = 0; i < selectedMultipleInvoices.length; i++) {
        const invoice = selectedMultipleInvoices[i];
        
        for (let j = 0; j < invoice.facturas.length; j++) {
            const factura = invoice.facturas[j];
            
            if (Array.isArray(conceptDelivery)) {
                const hasEvidence = conceptDelivery.some(
                    doc => String(doc.documentMeico) === String(factura.numeroFactura)
                );
                
                if (!hasEvidence) {
                    allCompleted = false;
                    break;
                }
            } else {
                allCompleted = false;
                break;
            }
        }
        
        if (!allCompleted) {
            break;
        }
    }

    const handleStatusChange = (status: "total" | "parcial" | "rechazo" | null) => {
        setShowStatusDelivery?.(status);

        // Enviar al padre si existe la prop
        if (onStatusChange) {
            onStatusChange(status);
        }
    };

    return (
        <View >
            <View style={styles.headerContainerTwo}>
                <Text style={styles.headerTitleTWO}>Estado de entrega</Text>
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
                    isCompleted={allCompleted} // Usar el resultado del for
                    selectedStatus={selectedStatus}
                    conceptDelivery={conceptDelivery}
                    typeDerlivery={typeDerlivery}
                    containerWidth={340}
                />
            </ScrollView>
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
    headerContainerTwo: {
        width: '100%',
        backgroundColor: '#F9F9FA',
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
});

export default AllSelectedOrder;