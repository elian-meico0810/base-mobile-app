"use client";
import { AddEvidenceButton } from '@/components/inputs/AddEvidenceButton';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuideDetails } from '../../domain/details/DetailsGuide';
import { DerliveryDocument } from '../../domain/invoices/InvoicesInterFace';

interface InvoiceItemProps {
  invoice: any;
  index: number;
  isSelected: boolean;
  onSelect: (invoice: any, parentGuide: GuideDetails) => void;
  parentGuide: GuideDetails;
  documentMeico?: string;
  conceptDelivery?: DerliveryDocument | DerliveryDocument[] | null;
  isSelect: boolean;
  activeView: boolean;
  showCheckbox?: boolean;
}

const InvoiceItem = ({
  invoice,
  index,
  isSelected,
  onSelect,
  parentGuide,
  documentMeico,
  conceptDelivery,
  isSelect,
  activeView,
  showCheckbox = false
}: InvoiceItemProps) => {
  const hasEvidence = (numeroFactura: string): boolean => {
    if (Array.isArray(conceptDelivery)) {
      return conceptDelivery.some(
        (doc) => String(doc.documentMeico) === String(numeroFactura)
      );
    }
    return false;
  };

  return (
    <TouchableOpacity
      style={[
        styles.invoiceContainer,
        isSelected && styles.selectedContainer,
        !activeView && {
          backgroundColor: '#FFFFFF',
          opacity: 0.6,
          borderColor: '#F0F1F5',
          borderWidth: 1,
        }
      ]}
      onPress={() => onSelect(invoice, parentGuide)}
      activeOpacity={0.7}
    >
      <View style={styles.rowBetween}>
        {/* Checkbox individual */}
        {showCheckbox && (
          <TouchableOpacity
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onSelect(invoice, parentGuide);
            }}
          >
            {isSelected && <Text style={styles.checkboxIcon}>✓</Text>}
          </TouchableOpacity>
        )}

        <View style={styles.contentContainer}>
          {/* Estado */}
          <View style={[
            styles.statusContainer,
            hasEvidence(invoice.numeroFactura)
              ? { backgroundColor: '#DFF5E1' }
              : {}]}>
            <Text style={[
              styles.status,
              hasEvidence(invoice.numeroFactura)
                ? { color: '#1F9144' }
                : {}]}>
              {hasEvidence(invoice.numeroFactura) ? "Entregado" : "Pendiente"}
            </Text>
          </View>

          {/* Order + Valor + Flecha */}
          <View style={styles.rowBetween}>
            <Text style={styles.orderText}>
              Factura n° {invoice.numeroFactura || '00000'}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.amountText}>
                {invoice?.tipo === "CONTADO EFECTIVO" ? "Contra-entrega" : "Crédito"}
              </Text>

              {/* Icono de enviar */}
              {invoice?.tipo === "CONTADO EFECTIVO" ? (
                <View style={styles.iconBox}>
                  <Image
                    source={require('@/assets/icons/Send.png')}
                    style={styles.icon}
                  />
                </View>
              ) : null}
            </View>
          </View>

          {/* Tipo de factura */}
          {invoice?.tipo === "CONTADO EFECTIVO" ? (
            <Text style={styles.codText} numberOfLines={1} ellipsizeMode="tail">
              {invoice?.tipo === "CONTADO EFECTIVO" ? "Contra-entrega" : "Crédito"}
            </Text>
          ) : null}

        </View>
      </View>

      {hasEvidence(invoice.numeroFactura) && (
        <AddEvidenceButton
          title="Evidencias cargadas"
          backgroundColor="#EAF7ED"
          textColor="#1F9144"
          iconColor="#1F9144"
          showEndIcon={true}
          spaced={true}
          disabled={true}
        />
      )}
    </TouchableOpacity>
  );
};

interface InvoicesListProps {
  invoices?: GuideDetails[] | GuideDetails;
  guide?: GuideDetails;
  onInvoiceSelect?: (selectedGuide: GuideDetails | null) => void;
  onInvoicesMultiSelect?: (selectedGuides: GuideDetails[]) => void; // Nuevo prop para selección múltiple
  isSelectInvocies?: string;
  documentMeico?: string;
  numberGuide?: number;
  token: string;
  conceptDelivery?: DerliveryDocument | DerliveryDocument[] | null;
  isSelect?: boolean;
  activeView?: boolean;
  showCheckboxes?: boolean; // Nuevo prop para mostrar checkboxes
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
  showCheckboxes = false // Por defecto no mostrar checkboxes
}: InvoicesListProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set()); // Para múltiples selecciones
  const [selectedGuideData, setSelectedGuideData] = useState<GuideDetails | null>(null);
  const [selectedGuidesData, setSelectedGuidesData] = useState<GuideDetails[]>([]); // Para múltiples selecciones
  const [response, setResponse] = useState<any>(null);
  let dataToProcess: GuideDetails[] = [];

  if (response?.data) {
    dataToProcess = [response?.data[0]];
  } else if (guide) {
    dataToProcess = [guide];
  } else if (invoices) {
    dataToProcess = Array.isArray(invoices) ? invoices : [invoices];
  }

  // Preparar datos de todas las facturas con su parentGuide
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

  const handleInvoiceSelect = (invoice: any, parentGuide: GuideDetails) => {
    if (showCheckboxes) {
      // Modo selección múltiple con checkboxes
      const invoiceId = invoice.numeroFactura;
      const newSelectedIds = new Set(selectedInvoiceIds);

      if (newSelectedIds.has(invoiceId)) {
        newSelectedIds.delete(invoiceId);

        // Remover de la lista de guías seleccionadas
        const newSelectedGuides = selectedGuidesData.filter(
          guide => !guide.facturas?.some(f => f.numeroFactura === invoiceId)
        );
        setSelectedGuidesData(newSelectedGuides);

        // Notificar al componente padre
        if (onInvoicesMultiSelect) {
          onInvoicesMultiSelect(newSelectedGuides);
        }
      } else {
        newSelectedIds.add(invoiceId);

        // Agregar a la lista de guías seleccionadas
        const selectedGuide: GuideDetails = {
          ...parentGuide,
          facturas: [invoice]
        };
        const newSelectedGuides = [...selectedGuidesData, selectedGuide];
        setSelectedGuidesData(newSelectedGuides);

        // Notificar al componente padre
        if (onInvoicesMultiSelect) {
          onInvoicesMultiSelect(newSelectedGuides);
        }
      }

      setSelectedInvoiceIds(newSelectedIds);
    } else {
      // Modo selección única (comportamiento original)
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
          facturas: [invoice]
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
      // Si ya están todas seleccionadas, deseleccionar todas
      setSelectedInvoiceIds(new Set());
      setSelectedGuidesData([]);
      if (onInvoicesMultiSelect) {
        onInvoicesMultiSelect([]);
      }
    } else {
      // Seleccionar todas
      const allIds = new Set<string>();
      const allSelectedGuides: GuideDetails[] = [];

      // Mapa temporal para agrupar por facturas únicas
      const facturaMap = new Map<string, GuideDetails>();

      allInvoicesWithParent.forEach(item => {
        const facturaId = item.invoice.numeroFactura;
        allIds.add(facturaId);

        // Si la factura ya fue procesada, omitir
        if (facturaMap.has(facturaId)) {
          return;
        }

        // Crear guía para esta factura específica
        const selectedGuide: GuideDetails = {
          ...item.parentGuide,
          facturas: [item.invoice]
        };

        facturaMap.set(facturaId, selectedGuide);
      });

      // Convertir mapa a array
      const guidesArray = Array.from(facturaMap.values());

      setSelectedInvoiceIds(allIds);
      setSelectedGuidesData(guidesArray);

      if (onInvoicesMultiSelect) {
        onInvoicesMultiSelect(guidesArray);
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
            selectedInvoiceIds.size === allInvoicesWithParent.length && styles.checkboxSelected
          ]}>
            {selectedInvoiceIds.size === allInvoicesWithParent.length && (
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