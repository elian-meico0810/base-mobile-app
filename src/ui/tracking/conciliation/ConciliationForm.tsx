import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { ThemedView } from "@/components/themed-view";
import { StatusInvoice, TypeValueParameterEnum } from "@/src/constants/GuideStates";
import { ConciliationRouteResponse } from "@/src/features/tracking/domain/details/DetailsGuide";
import { TypeParameterValue } from "@/src/features/tracking/domain/invoices/InvoicesInterFace";
import { detailsRepositoryImpl } from "@/src/features/tracking/infrastructure/details/detailsRepositoryImpl";
import { invoiceRepositoryImpl } from "@/src/features/tracking/infrastructure/invoices/invoiceRepositoryImpl";
import { getDeviceDateTime, heightCaldulate } from "@/src/utils/uitls";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width, height } = Dimensions.get("window");

interface ConciliationFormProps {
  initialGuide?: string;
  token?: string;
  onSubmit: (params: { guide: string; token: string }) => void | Promise<void>;
}

export function ConciliationForm({
  initialGuide = "",
  token = "",
  onSubmit,
}: ConciliationFormProps) {
  const [guide] = useState(initialGuide);
  const [data, setData] = useState<ConciliationRouteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [valueParameter, setValueParameter] = useState<TypeParameterValue[]>([]);

  const format = useMemo(
    () => (n?: number) => `$${Number(n ?? 0).toLocaleString("es-CO")}`,
    [],
  );


  // Se suma el valor de los productos rechazados poder igualar el valor a recaudar 


  useEffect(() => {
    loadConciliation();
    listTypeParameterValue();
  }, []);

  const loadConciliation = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await detailsRepositoryImpl.getConciliationRoute(
        guide,
        token,
      );
      setData(res);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handelClick = async () => {
    try {
      setStatusValue(StatusInvoice.CLOSE);
      await finshRoute();
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const isSmallScreen = height <= 780;
  const heightValue = heightCaldulate();

  const handleGoBack = () => {
    router.back();
  };

  const finshRoute = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const responseData = await detailsRepositoryImpl.closeRouteInit(
        {
          codigoGuia: String(guide),
          latitud: String(location.coords.latitude),
          longitud: String(location.coords.longitude),
          fechaHoraDispositivo: getDeviceDateTime()
        },
        token
      );
      if (responseData?.statusCode == 200) {
        router.replace({
          pathname: "/views/details",
          params: {
            guide: guide,
            token: token,
            success: "route_closed",
          },
        });
      } else {
        setModalTitle("¡Alerta!");
        setModalMessage(responseData?.message ?? "Ocurrió un error inesperado.");
        setModalVisible(true);
      }
    } catch (error: any) {
      setModalTitle("¡Error!");
      setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  const listTypeParameterValue = async () => {
    try {
      setLoading(true);

      const response = await invoiceRepositoryImpl.typeParameterValue(TypeValueParameterEnum.TOLERANCE_MARGIN_FINISH_GUIDE, token);
      if (response?.statusCode === 200 && Array.isArray(response.data)) {
        setValueParameter(response.data);
      } else {
        setValueParameter([]);
        setModalTitle("¡Alerta!");
        setModalMessage(response?.message ?? "Ocurrió un error inesperado.");
        setModalVisible(true);
      }
    } catch (error: any) {
      setModalTitle("¡Error!");
      setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const toleranceValue = (valueParameter ?? []).reduce((acc, item) => {
    const value = Number(item.valor);
    return !isNaN(value) ? acc + value : acc;
  }, 0);

  console.log("toleranceValue:", toleranceValue);
  console.log("expectedAmount:", data?.valor_total);
  console.log("collectedAmount:", data?.valor_recaudado);

  const expectedAmount = Number(data?.valor_total ?? 0);
  const collectedAmount = Number(data?.valor_recaudado ?? 0);
  const rejectedAmount = Number(data?.total_rechazado ?? 0);

  const totalAmount = collectedAmount + rejectedAmount;

  let isSuccess = false;

  if (data) {

    if (data && totalAmount >= expectedAmount) {
      isSuccess = true;

    } else if (collectedAmount >= expectedAmount) {
      isSuccess = true;

    } else {
      const difference = expectedAmount - collectedAmount;
      if (difference <= toleranceValue) {
        isSuccess = true;
      }
    }
  }

  console.log("canProceed:", isSuccess);
  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Image
            source={require("@/assets/icons/BackArrow.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuadre de ruta</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          {isSuccess && (
            <View style={[styles.statusCard, styles.successCard]}>
              <MaterialIcons name="check-circle" size={24} color="#1AA34A" />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Ruta cuadrada</Text>
                <Text style={styles.statusSub}>
                  Tu recaudo cubre el valor total esperado
                </Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Row label="Valor esperado" value={format(data?.valor_total)} />
            <Row
              label="Productos rechazados"
              value={format(data?.total_rechazado)}
            />
            <Row
              label="Valor recaudado"
              value={format(data?.valor_recaudado)}
              bold
              green={isSuccess}
            />
            <View style={styles.separator} />
            <Row
              label="Efectivo"
              value={format(data?.concepto?.efectivo)}
              muted
              mutedValue
            />
            <Row
              label="QR Link"
              value={format(data?.concepto?.qr_link)}
              muted
              mutedValue
            />
            <Row
              label="Consignaciones"
              value={format(data?.concepto?.consignaciones)}
              muted
              mutedValue
            />
            <Row
              label="Otros"
              value={format(data?.concepto?.otros)}
              muted
              mutedValue
            />
          </View>

          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => {
              router.push({
                pathname: '/views/consignaciones',
                params: { codigoGuia: guide, token: token }
              })
            }}
          >
            <View style={styles.cardRowContent}>
              <View style={styles.cardRowInner}>
                <Image
                  source={require("@/assets/icons/HandCoin.jpg")}
                  style={styles.walletIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cardRowText}>Consignaciones en ruta</Text>
              </View>
              <Image
                source={require("@/assets/icons/ArrowRight.png")}
                style={styles.ArrowRight}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.buttonContainer,
          {
            paddingBottom: isSmallScreen ? 12 : heightValue ? 60 : 50,
          },
        ]}
      >
        <PrimaryButton
          title="Finalizar Ruta"
          onPress={() => {
            if (isSuccess) {
              handelClick();
            }
          }
          }
          disabled={!isSuccess}
          width={328}
          height={43}
        />
      </View>

      {loading && <LoadingBlue />}
    </ThemedView>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  green,
  mutedValue,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  green?: boolean;
  mutedValue?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.rowLabel,
          muted && styles.mutedText,
          bold && styles.boldText,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.rowValue,
          bold && styles.boldText,
          green && styles.greenText,
          mutedValue && styles.mutedText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FA",
  },
  contentWrapper: {
    flex: 1,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 5,
    backgroundColor: "#F9F9FA",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontFamily: "Rubik",
    fontWeight: "700",
    fontSize: 18,
    color: "#000",
    marginLeft: 0,
  },
  placeholder: {
    width: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    color: "black",
  },

  loadingText: {
    fontSize: 16,
    backgroundColor: "#F2F4F7",
    color: "black",
  },

  content: {
    padding: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    backgroundColor: "#F2F4F7",
  },

  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  statusIconText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },

  successCard: {
    backgroundColor: "#EAF7ED",
    borderColor: "#1AA34A",
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1AA34A",
    marginBottom: 2,
  },

  statusSub: {
    fontSize: 14,
    color: "#1F9144",
    lineHeight: 20,
  },

  warningCard: {
    backgroundColor: "#FFF4E5",
    borderColor: "#D97706",
  },

  warningText: {
    color: "#D97706",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  cardRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "column",
    gap: 4,
    borderWidth: 1,
    borderColor: "#EAECF0",
  },

  cardRowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  cardRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardRowText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#344054",
  },

  arrow: {
    fontSize: 18,
    color: "#6B7280",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  rowLabel: {
    fontSize: 14,
  },

  rowValue: {
    fontSize: 14,
  },

  mutedText: {
    color: "#788095",
    fontSize: 14,
  },

  boldText: {
    fontWeight: "700",
  },

  greenText: {
    color: "#1AA34A",
  },

  separator: {
    height: 1,
    backgroundColor: "#F0F1F5",
    marginVertical: 10,
    width: 304,
  },

  button: {
    margin: 20,
    backgroundColor: "#1E3A8A",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  walletIcon: {
    width: 20,
    height: 20,
  },
  ArrowRight: {
    width: 16,
    height: 16,
  },
});
