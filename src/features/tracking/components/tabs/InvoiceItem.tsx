"use client";
import { AddEvidenceButton } from '@/components/inputs/AddEvidenceButton';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuideDetails } from '../../domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '../../infrastructure/details/detailsRepositoryImpl';

interface InvoiceItemProps {
  invoice: any;
  index: number;
  isSelected: boolean;
  onSelect: (invoice: any, parentGuide: GuideDetails) => void;
  parentGuide: GuideDetails;
  documentMeico?: string;
}

const InvoiceItem = ({ invoice, index, isSelected, onSelect, parentGuide, documentMeico }: InvoiceItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.invoiceContainer, isSelected && styles.selectedContainer]}
      onPress={() => onSelect(invoice, parentGuide)}
      activeOpacity={0.7}
    >
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

      {/* Tipo de factura */}
      <Text style={styles.codText} numberOfLines={1} ellipsizeMode="tail">
        {invoice?.tipo === "CONTADO EFECTIVO" ? "Contra-entrega" : "Crédito"}
      </Text>
      {documentMeico && invoice.numeroFactura == documentMeico && (
        <AddEvidenceButton
          title="Evidencias cargadas"
          backgroundColor="#EAF7ED"
          textColor="#1F9144"
          iconColor="#1F9144"
          showEndIcon={true}
          spaced={true}
        />
      )}

      {/* Indicador de selección */}
    </TouchableOpacity>
  );
};

interface InvoicesListProps {
  invoices?: GuideDetails[] | GuideDetails;
  guide?: GuideDetails;
  onInvoiceSelect?: (selectedGuide: GuideDetails | null) => void;
  isSelectInvocies?: string;
  documentMeico?: string;
  numberGuide?: number;
  token: string
}

const InvoicesList = ({ invoices, guide, onInvoiceSelect, isSelectInvocies, documentMeico, numberGuide, token }: InvoicesListProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedGuideData, setSelectedGuideData] = useState<GuideDetails | null>(null);
  const [response, setResponse] = useState<any>(null);
  let dataToProcess: GuideDetails[] = [];

  useEffect(() => {
    const fetchGuide = async () => {
      if (!isSelectInvocies) return;

      try {
        const resp = await detailsRepositoryImpl.listGuide(
          Number(numberGuide),
          token
        );
        setResponse(resp);
      } catch (error) {
        throw error;
      }
    };

    fetchGuide();
  }, [isSelectInvocies, numberGuide, token]);

  if (response?.data) {
    dataToProcess = [response?.data[0]];
  }else if (guide) {
    dataToProcess = [guide];
  } else if (invoices) {
    dataToProcess = Array.isArray(invoices) ? invoices : [invoices];
  }

  const handleInvoiceSelect = (invoice: any, parentGuide: GuideDetails) => {
    // Solo permitir seleccionar una factura
    if (selectedInvoiceId === invoice.numeroFactura) {

      setSelectedInvoiceId(null);
      setSelectedGuideData(null);
      if (onInvoiceSelect) {
        onInvoiceSelect(null);
      }
    } else {
      // Seleccionar nueva factura
      setSelectedInvoiceId(invoice.numeroFactura);

      const selectedGuide: GuideDetails = {
        ...parentGuide,
        facturas: [invoice]
      };

      setSelectedGuideData(selectedGuide);

      // Notificar al componente padre
      if (onInvoiceSelect) {
        onInvoiceSelect(selectedGuide);
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

  const allInvoicesWithParent: Array<{ invoice: any, parentGuide: GuideDetails }> = [];

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
          parentGuide: guideItem
        });
      });
    }
  });

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

  const renderInvoices = () => (
    <View>
      {allInvoicesWithParent.map((item, index) => (
        <InvoiceItem
          key={`${item.invoice.numeroFactura}-${index}`}
          invoice={item.invoice}
          index={index}
          isSelected={selectedInvoiceId === item.invoice.numeroFactura}
          onSelect={handleInvoiceSelect}
          parentGuide={item.parentGuide}
          documentMeico={documentMeico}
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
    color: '#4F74C4',
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 12,
    alignSelf: 'center',
  },
  selectedContainer: {
    borderColor: '#4F74C4',
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
  selectionIndicator: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  selectionText: {
    fontFamily: 'Rubik',
    fontWeight: '600',
    fontSize: 10,
    color: '#FFFFFF',
  },
});

export { InvoiceItem };
export default InvoicesList;