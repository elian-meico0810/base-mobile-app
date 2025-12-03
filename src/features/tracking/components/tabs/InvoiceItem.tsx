import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GuideDetails } from '../../domain/details/DetailsGuide';

const InvoiceItem = ({ invoice, index }: { invoice: any; index: number }) => {
    return (
        <View style={styles.invoiceContainer}>
            {/* Estado */}
            <View style={styles.statusContainer}>
                <Text style={styles.status}>Pendiente</Text>
            </View>

            {/* Order + Valor + Flecha */}
            <View style={styles.rowBetween}>
                <Text style={styles.orderText}>
                    Order #{invoice.numeroFactura?.slice(-5) || '00000'}
                </Text>

                <View style={styles.priceRow}>
                    <Text style={styles.amountText}>
                        {'$ ' + (Number(invoice?.valorTotal) || 0).toLocaleString('es-CO', {
                            minimumFractionDigits: 0,
                        })}
                    </Text>

                    <View style={styles.iconBox}>
                        <Image
                            source={require('@/assets/icons/Send.png')}
                            style={styles.icon}
                        />
                    </View>
                </View>
            </View>

            {/* Tipo de factura - Ajustado para que no se salga */}
            <Text style={styles.codText} numberOfLines={1} ellipsizeMode="tail">
                {invoice?.tipo === "CONTADO EFECTIVO" ? "Contra-entrega" : "Crédito"}
            </Text>
        </View>
    );
};

const InvoicesList = ({ invoices, guide }: { 
    invoices?: GuideDetails[] | GuideDetails; 
    guide?: GuideDetails 
}) => {
    let dataToProcess: GuideDetails[] = [];

    if (guide) {
        dataToProcess = [guide];
    } else if (invoices) {
        dataToProcess = Array.isArray(invoices) ? invoices : [invoices];
    }

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

    const allInvoices: any[] = [];
    
    dataToProcess.forEach((guideItem) => {
        if (guideItem.facturas && guideItem.facturas.length > 0) {
            guideItem.facturas.forEach((factura) => {
                allInvoices.push({
                    ...factura,
                    cliente: guideItem.nombreCliente,
                    direccion: guideItem.direccion,
                    poblacion: guideItem.poblacion,
                    codigoCliente: guideItem.codigoCliente
                });
            });
        }
    });

    if (allInvoices.length === 0) {
        return (
            <View>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Órdenes a entregar</Text>
                </View>
                <Text style={styles.noDataText}>No tiene facturas</Text>
            </View>
        );
    }

    const renderInvoices = () => (
        <View>
            {allInvoices.map((invoice, index) => (
                <InvoiceItem
                    key={`${invoice.numeroFactura}-${index}`}
                    invoice={invoice}
                    index={index}
                />
            ))}
        </View>
    );

    if (allInvoices.length > 2) {
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
    noDataText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Rubik',
    },
    invoiceContainer: {
        width: 340,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        marginBottom: 12,
        alignSelf: 'center',
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
        lineHeight: 16, // Aumentado para mejor espaciado
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
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
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
});

export { InvoiceItem };
export default InvoicesList;