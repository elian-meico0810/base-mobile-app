"use client";
import { AddEvidenceButton } from '@/components/inputs/AddEvidenceButton';
import { TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { formatNumber } from '@/src/utils/uitls';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuideDetails, NovletyOrder } from '../../domain/details/DetailsGuide';
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
  conceptDeliverySelect?: NovletyOrder | NovletyOrder[] | null;
  disabledInvoices?: Set<string>;

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
  showCheckbox = false,
  conceptDeliverySelect,
  disabledInvoices
}: InvoiceItemProps) => {
  const hasEvidence = (numeroFactura: string) => {

    if (Array.isArray(parentGuide?.pedidos) && Array.isArray(conceptDeliverySelect)) {
      const factura = parentGuide.facturas?.find(
        f => String(f.numeroFactura) === String(numeroFactura)
      );

      if (!factura) return false;

      const pedido = parentGuide.pedidos.find(
        p => String(p.codigo) === String(factura.numeroPedido)
      );

      if (!pedido) return false;

      return conceptDeliverySelect.some(
        doc => Number(doc.id_pedido) === Number(pedido.id)
      );
    }

    else if (Array.isArray(conceptDelivery) && conceptDelivery.length > 0) {

      return conceptDelivery.some(
        doc => String(doc.documentMeico) === String(numeroFactura)
      );
    }

    return false;
  };

  const evidence = hasEvidence(invoice.numeroFactura);

  const isDisabled = disabledInvoices?.has(String(invoice.numeroFactura));

  const canShowCheckbox =
    showCheckbox &&
    (!evidence);

  var value = '';
  switch (invoice?.tipo) {
    case TypeInvoiceEnum.CONTADO_EFECTIVO:
      value = 'Contra-entrega';
      break;

    case TypeInvoiceEnum.CREDITO:
      value = 'Credito';
      break;

    case TypeInvoiceEnum.ANTICIPO:
      value = 'Anticipado';
      break;

    case TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO:
      value = 'Aplicativo-meico';
      break;
  }
  const validation = evidence && (invoice?.tipo != TypeInvoiceEnum.CONTADO_EFECTIVO || invoice?.tipo != TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO);

  return (
    <TouchableOpacity
      disabled={(validation || isDisabled) ? true : false}
      style={[
        styles.invoiceContainer,
        isSelected && styles.selectedContainer,
        (!activeView || validation || isDisabled) && {
          backgroundColor: '#FFFFFF',
          opacity: 0.6,
          borderColor: '#f3f0f5',
          borderWidth: 1,
        }
      ]}
      onPress={() => !isDisabled && onSelect(invoice, parentGuide)}
      activeOpacity={0.7}
    >
      <View style={styles.rowBetween}>
        {/* Checkbox individual */}
        {canShowCheckbox && (
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
            (evidence || isDisabled)
              ? { backgroundColor: '#DFF5E1' }
              : {}]}>
            <Text style={[
              styles.status,
              (evidence || isDisabled)
                ? { color: '#1F9144' }
                : {}]}>
              {(evidence || isDisabled) ? "Entregado" : "Pendiente"}
            </Text>
          </View>

          {/* Order + Valor + Flecha */}
          <View style={styles.rowBetween}>
            <Text style={styles.orderText}>
              Factura n° {invoice.numeroFactura || '00000'}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.amountText}>
                {(
                  invoice?.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO ||
                  invoice?.tipo === TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO
                )
                  ? `$${formatNumber(invoice.valorRecaudar)}`
                  : value
                }
              </Text>

            </View>
          </View>

          {(invoice?.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO || invoice?.tipo === TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO) ? (
            <Text style={styles.codText} numberOfLines={1} ellipsizeMode="tail">
              {value}
            </Text>
          ) : null}

        </View>
      </View>

      {(evidence || isDisabled) && (
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

