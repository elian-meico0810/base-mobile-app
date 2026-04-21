"use client";
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuideDetails, NovletyOrder } from '../../domain/details/DetailsGuide';
import { DerliveryDocument } from '../../domain/invoices/InvoicesInterFace';
import { InvoiceItem } from './InvoiceItem';

interface InvoicesListProps {
    invoices?: GuideDetails[] | GuideDetails;
    guide: GuideDetails;
    onInvoiceSelect?: (selectedGuide: GuideDetails | null) => void;
    onInvoicesMultiSelect?: (selectedGuides: GuideDetails[]) => void;
    isSelectInvocies?: string;
    documentMeico?: string;
    numberGuide?: number;
    token: string;
    conceptDelivery?: DerliveryDocument | DerliveryDocument[] | null;
    isSelect?: boolean;
    activeView?: boolean;
    showCheckboxes?: boolean; // Nuevo prop para mostrar checkboxes
    conceptDeliverySelect?: NovletyOrder | NovletyOrder[] | null;
    disabledInvoices?: Set<string>;

}


const InvoicesList = ({
    invoices,
    guide,
    onInvoiceSelect,
    onInvoicesMultiSelect,
    isSelectInvocies,
    documentMeico,
    numberGuide,
    token,
    conceptDelivery,
    isSelect = false,
    activeView = false,
    showCheckboxes = false,
    conceptDeliverySelect,
    disabledInvoices
}: InvoicesListProps) => {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
    const [selectedGuideData, setSelectedGuideData] = useState<GuideDetails | null>(null);
    const [selectedGuidesData, setSelectedGuidesData] = useState<GuideDetails[]>([]);
    const [response, setResponse] = useState<any>(null);
    let dataToProcess: GuideDetails[] = [];

    if (response?.data) {
        dataToProcess = [response?.data[0]];
    } else if (guide) {
        dataToProcess = [guide];
    } else if (invoices) {
        dataToProcess = Array.isArray(invoices) ? invoices : [invoices];
    }

    const allInvoicesWithParent: Array<{ invoice: any, parentGuide: GuideDetails, pedidos: any }> = [];


    dataToProcess.forEach((guideItem) => {
        if (guideItem.facturas && guideItem.facturas.length > 0) {
            guideItem.facturas.forEach((factura) => {
                allInvoicesWithParent.push({
                    invoice: {
                        ...factura,
                        cliente: guideItem.nombreCliente,
                        direccion: guideItem.direccion,
                        poblacion: guideItem.poblacion,
                        codigoCliente: guideItem.codigoCliente
                    },
                    pedidos: guideItem.pedidos,
                    parentGuide: {
                        ...guideItem,
                        pedidos: guideItem.pedidos
                    }
                });
            });
        }
    });

    const handleInvoiceSelect = (invoice: any, parentGuide: GuideDetails) => {

        if (showCheckboxes) {
            // Modo selección múltiple con checkboxes
            const invoiceId = invoice.numeroFactura;
            const newSelectedIds = new Set(selectedInvoiceIds);

            if (newSelectedIds.has(invoiceId)) {
                newSelectedIds.delete(invoiceId);

                const newSelectedGuides = selectedGuidesData.filter(
                    guide => !guide.facturas?.some(f => f.numeroFactura === invoiceId)
                );
                setSelectedGuidesData(newSelectedGuides);

                if (onInvoicesMultiSelect) {
                    onInvoicesMultiSelect(newSelectedGuides);
                }
            } else {
                newSelectedIds.add(invoiceId);

                const selectedGuide: GuideDetails = {
                    ...parentGuide,
                    facturas: [invoice],
                    pedidos: parentGuide.pedidos
                };
                const newSelectedGuides = [...selectedGuidesData, selectedGuide];
                setSelectedGuidesData(newSelectedGuides);

                if (onInvoicesMultiSelect) {
                    onInvoicesMultiSelect(newSelectedGuides);
                }
            }

            setSelectedInvoiceIds(newSelectedIds);
        } else {
            if (selectedInvoiceId === invoice.numeroFactura) {
                setSelectedInvoiceId(null);
                setSelectedGuideData(null);
                if (onInvoiceSelect) {
                    onInvoiceSelect(null);
                }
            } else {
                setSelectedInvoiceId(invoice.numeroFactura);
                const selectedGuide: GuideDetails = {
                    ...parentGuide,
                    facturas: [invoice],
                    pedidos: parentGuide.pedidos

                };
                setSelectedGuideData(selectedGuide);
                if (onInvoiceSelect) {
                    onInvoiceSelect(selectedGuide);
                }
            }
        }
    };

    const handleSelectAll = () => {
        if (!showCheckboxes) return;

        if (selectedInvoiceIds.size === allInvoicesWithParent.length) {
            setSelectedInvoiceIds(new Set());
            setSelectedGuidesData([]);
            if (onInvoicesMultiSelect) {
                onInvoicesMultiSelect([]);
            }
        } else {
            // Seleccionar todas
            const allIds = new Set<string>();
            const facturaMap = new Map<string, GuideDetails>();

            allInvoicesWithParent.forEach(item => {
                const facturaId = item.invoice.numeroFactura;
                allIds.add(facturaId);

                if (!facturaMap.has(facturaId)) {
                    const selectedGuide: GuideDetails = {
                        ...item.parentGuide,
                        facturas: [item.invoice],
                        pedidos: item.pedidos
                    };
                    facturaMap.set(facturaId, selectedGuide);
                }
            });

            let filteredIds = Array.from(allIds);

            // Verificar si conceptDelivery es válido
            if (conceptDelivery) {
                let deliveryArray: any[] = [];
                if (Array.isArray(conceptDelivery)) {
                    deliveryArray = conceptDelivery;
                } else {
                    deliveryArray = [conceptDelivery];
                }

                if (deliveryArray.length > 0) {
                    // Obtener los documentMeico ya procesados
                    const existingDocumentMeicos = deliveryArray
                        .map((item: DerliveryDocument) => item.documentMeico?.toString())
                        .filter(Boolean) as string[];

                    filteredIds = Array.from(allIds).filter(id =>
                        !existingDocumentMeicos.includes(id)
                    );
                }
            }

            const selectedIdsSet = new Set(filteredIds);

            const filteredGuidesArray = Array.from(facturaMap.values())
                .filter(guide => {
                    const facturaId = guide.facturas[0]?.numeroFactura;
                    return selectedIdsSet.has(facturaId);
                });

            setSelectedInvoiceIds(selectedIdsSet);
            setSelectedGuidesData(filteredGuidesArray);

            if (onInvoicesMultiSelect) {
                onInvoicesMultiSelect(filteredGuidesArray);
            }
        }
    };

    if (!dataToProcess || dataToProcess.length === 0) {
        return (
            <View>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Órdenes a entregar</Text>
                </View>
                <Text style={styles.noDataText}>No tiene facturas</Text>
            </View>
        );
    }

    if (allInvoicesWithParent.length === 0) {
        return (
            <View>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Órdenes a entregar</Text>
                </View>
                <Text style={styles.noDataText}>No tiene facturas</Text>
            </View>
        );
    }

    const selectableInvoices = allInvoicesWithParent.filter(item => {
        const id = String(item.invoice.numeroFactura);

        if (disabledInvoices?.has(id)) return false;

        if (conceptDelivery) {
            const deliveryArray = Array.isArray(conceptDelivery)
                ? conceptDelivery
                : [conceptDelivery];

            const existingDocumentMeicos = deliveryArray
                .map((doc: DerliveryDocument) => doc.documentMeico?.toString())
                .filter(Boolean);

            if (existingDocumentMeicos.includes(id)) return false;
        }

        return true;
    });
    
    const allSelected = selectableInvoices.length > 0 &&
        selectedInvoiceIds.size === selectableInvoices.length;
    const renderInvoices = () => (
        <View>
            {/* Checkbox "Seleccionar todas" */}
            {showCheckboxes && allInvoicesWithParent.length > 1 && (
                <TouchableOpacity
                    style={styles.selectAllContainer}
                    onPress={handleSelectAll}
                >
                    <View style={[
                        styles.checkbox,
                        allSelected && styles.checkboxSelected
                    ]}>
                        {selectedInvoiceIds.size === selectedGuidesData.length && (
                            <Text style={styles.checkboxIcon}>✓</Text>
                        )}
                    </View>
                    <Text style={styles.selectAllText}>
                        Seleccionar todas
                    </Text>
                </TouchableOpacity>
            )}

            {/* Lista de facturas */}
            {allInvoicesWithParent.map((item, index) => (
                <InvoiceItem
                    key={`${item.invoice.numeroFactura}-${index}`}
                    invoice={item.invoice}
                    index={index}
                    isSelected={showCheckboxes
                        ? selectedInvoiceIds.has(item.invoice.numeroFactura)
                        : selectedInvoiceId === item.invoice.numeroFactura
                    }
                    onSelect={handleInvoiceSelect}
                    parentGuide={item.parentGuide}
                    documentMeico={documentMeico}
                    conceptDelivery={conceptDelivery}
                    isSelect={isSelect}
                    activeView={activeView}
                    showCheckbox={showCheckboxes}
                    conceptDeliverySelect={conceptDeliverySelect}
                    disabledInvoices={disabledInvoices}
                />
            ))}
        </View>
    );

    if (allInvoicesWithParent.length > 2) {
        return (
            <ScrollView style={styles.scrollContainer}>
                {renderInvoices()}
            </ScrollView>
        );
    }

    return renderInvoices();
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    headerContainer: {
        paddingVertical: 12,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
        color: '#141D32',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Rubik',
        marginTop: 4,
    },
    selectedInfo: {
        fontSize: 12,
        fontFamily: 'Rubik',
        marginTop: 4,
        fontWeight: '600',
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Rubik',
    },
    invoiceContainer: {
        width: 340,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        marginBottom: 12,
        alignSelf: 'center',
    },
    selectedContainer: {
        borderWidth: 2,
        backgroundColor: '#F0F5FF',
    },
    orderText: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#141D32',
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
    extraInfo: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 10,
        lineHeight: 10,
        color: '#788095',
        marginTop: 4,
    },
    amountText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '800',
        color: '#141D32',
        lineHeight: 16,
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
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: -30,
    },
    iconBox: {
        width: 22,
        height: 22,
        backgroundColor: "#F0F0F0",
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 12,
        height: 12,
        resizeMode: 'contain',
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
    },
    checkboxSelected: {
        backgroundColor: '#164194',
    },
    checkboxIcon: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    selectAllText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        color: '#141D32',
        fontWeight: '500',
    },
});

export { InvoiceItem };
export default InvoicesList;