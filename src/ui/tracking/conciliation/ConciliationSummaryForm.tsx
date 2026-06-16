import { LoadingBlue } from "@/components/generals/LoadingBlue";
import { ThemedView } from "@/components/themed-view";
import { ConciliationRouteResponse } from "@/src/features/tracking/domain/details/DetailsGuide";
import { detailsRepositoryImpl } from "@/src/features/tracking/infrastructure/details/detailsRepositoryImpl";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  guide: string;
  token: string;
}

export function ConciliationSummary({ guide, token }: Props) {
  const [data, setData] = useState<ConciliationRouteResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const format = useMemo(
    () => (n?: number) => `$${Number(n ?? 0).toLocaleString("es-CO")}`,
    []
  );

  const isSuccess = data?.recaudo_completo ?? false;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await detailsRepositoryImpl.getConciliationRoute(
        guide,
        token
      );
      setData(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
    //router.push(
    //`/views/details?guide=${numberGuide}&token=${encodeURIComponent(token ?? "")}`,
    //);
  };

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

      <View style={styles.card}>
        {isSuccess && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Finalizada</Text>
          </View>
        )}

        <Text style={styles.routeText}>Ruta #{guide}</Text>

        <View style={styles.separator} />

        <Row label="Valor esperado" value={format(data?.valor_total)} />

        <Row
          label="Valor recaudado"
          value={format(data?.valor_recaudado)}
          bold
          green={isSuccess}
        />

        <View style={styles.separator} />

        <Row label="Efectivo" value={format(data?.concepto?.efectivo)} muted />
        <Row label="Transferencia" value={format(data?.concepto?.qr_link)} muted />
        <Row label="Consignaciones" value={format(data?.concepto?.consignaciones)} muted />
      </View>

      {loading && <LoadingBlue />}
    </ThemedView>
  );
}

function Row({
  label,
  value,
  bold,
  green,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, muted && styles.muted]}>
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          bold && styles.bold,
          green && styles.green,
          muted && styles.muted,
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
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  backIcon: {
    width: 24,
    height: 24,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 20,
  },

  badge: {
    alignSelf: "center",
    backgroundColor: "#EAF7ED",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 6,
  },

  badgeText: {
    color: "#1AA34A",
    fontWeight: "600",
    fontSize: 12,
  },

  routeText: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
  },

  value: {
    fontSize: 14,
  },

  bold: {
    fontWeight: "700",
  },

  green: {
    color: "#1AA34A",
  },

  muted: {
    color: "#788095",
  },

  separator: {
    height: 1,
    backgroundColor: "#F0F1F5",
    marginVertical: 10,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 35,
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
  placeholder: {
    width: 40,
  }
});
