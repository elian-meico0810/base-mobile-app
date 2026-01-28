import { ThemedView } from '@/components/themed-view';
import { Consignment, ConsignmentSummary } from '@/src/features/tracking/domain/consignments/Consignment';
import { consignmentRepositoryImpl } from '@/src/features/tracking/infrastructure/consignments/ConsignmentRepositoryImpl';
import { formatNumber } from '@/src/utils/uitls';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function ConsignacionesScreen() {
  const router = useRouter();
  const { codigoGuia } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ConsignmentSummary | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [codigoGuia]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) {
        Alert.alert("Error", "No se encontró el token de autenticación.");
        router.back();
        return;
      }
      
      const guideCode = Array.isArray(codigoGuia) ? codigoGuia[0] : codigoGuia;
      if (!guideCode) {
         // Fallback or handle missing guide code if necessary
         // For now assuming it's passed or handled
      }

      if (guideCode) {
          const data = await consignmentRepositoryImpl.getSummary(guideCode, token);
          setSummary(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cargar la información de consignaciones.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
         <Stack.Screen options={{ title: 'Consignaciones', headerShown: true, headerShadowVisible: false, headerBackVisible: false, headerTitle: () => <Text style={{ fontFamily: 'Rubik', fontWeight: '700', fontSize: 18, color: '#141D32' }}>Consignaciones</Text> }} />
        <ActivityIndicator size="large" color="#164194" />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Consignaciones',
          headerShown: true,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTitleAlign: 'left',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Svg width="23" height="23" viewBox="0 0 512 512" style={{ marginLeft: -10, marginBottom: -2 }}>
                <Path
                  fill="none"
                  stroke="#141D32"
                  strokeWidth={35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M328 112L184 256l144 144"
                />
              </Svg>
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <Text style={{ fontFamily: 'Rubik', fontWeight: '700', fontSize: 18, color: '#141D32' }}>
              Consignaciones
            </Text>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <View style={styles.fixedContent}>
          {summary && <StatsCard summary={summary} />}

          <TouchableOpacity style={styles.registerButton} activeOpacity={0.8}>
            <Image
              source={require('@/assets/icons/ConsignmentIcons.png')}
              style={styles.registerIcon}
            />
            <Text style={styles.registerText}>Registrar consignación</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Historial</Text>
        </View>

        <ScrollView 
          style={styles.historyScroll}
          contentContainerStyle={styles.historyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {(!summary || !summary.consignaciones || summary.consignaciones.length === 0) ? (
             <EmptyState />
          ) : (
             <View style={styles.historyList}>
               {summary.consignaciones.map((item) => (
                 <HistoryCard
                   key={item.id}
                   item={item}
                 />
               ))}
             </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

function StatsCard({ summary }: { summary: ConsignmentSummary }) {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsLeft}>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>${formatNumber(summary.totalEfectivo)}</Text>
          <Text style={styles.amountLabel}>Total efectivo recaudado</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>${formatNumber(summary.totalConsignado)}</Text>
          <Text style={styles.amountLabel}>Total consignado en ruta</Text>
        </View>
      </View>

      <View style={styles.donutContainer}>
        <View style={styles.donutRing} />
        <View style={styles.donutCenter}>
          <Text 
            style={styles.donutValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            ${(summary.porConsignar <= 0 ? "0" : formatNumber(summary.porConsignar))}
          </Text>
          <Text style={styles.donutLabel}>Por consignar</Text>
        </View>
      </View>
    </View>
  );
}

function HistoryCard({ item }: { item: Consignment }) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Consignación #{item.id}</Text>
        <Ionicons name="ellipsis-vertical" size={18} color="#788095" />
      </View>

      <View style={styles.historyRow}>
        <View style={styles.historyCol}>
          <Text style={styles.historyLabel}>Valor consignado</Text>
        </View>
        <Text style={styles.historyValue}>${formatNumber(item.valorConsignado)}</Text>
      </View>

      <View style={styles.historyRow}>
        <View style={styles.historyCol}>
          <Text style={styles.historyLabel}>Fecha</Text>
        </View>
        <Text style={styles.historyDate}>{formatDate(item.fechaHoraDispositivo)}</Text>
      </View>
    </View>
  );
}

function formatDate(isoString: string) {
  const d = new Date(isoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${month} ${day}, ${year} - ${hour}:${min} ${ampm}`;
}

function EmptyState() {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="documents-outline" size={48} color="#C4C4C4" />
      </View>
      <Text style={styles.emptyStateTitle}>No hay información</Text>
      <Text style={styles.emptyStateText}>No se encontraron consignaciones registradas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Rubik',
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    justifyContent: 'center', 
    alignItems: 'center'
  },
  fixedContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  historyScroll: {
    flex: 1,
    width: '100%',
  },
  historyScrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  statsCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsLeft: {
    flex: 1,
    paddingRight: 16,
  },
  amountRow: {
    marginBottom: 12,
  },
  amountValue: {
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 16,
    color: '#141D32',
    marginBottom: 4,
  },
  amountLabel: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 12,
    color: '#788095',
  },
  donutContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 6,
    borderTopColor: '#164194',
    borderRightColor: '#164194',
    borderBottomColor: '#F9F9FA',
    borderLeftColor: '#F9F9FA',
  },
  donutCenter: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  donutValue: {
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 12,
    color: '#141D32',
  },
  donutLabel: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 10,
    color: '#788095',
  },
  registerButton: {
    width: width * 0.9,
    height: 32,
    backgroundColor: '#EAF1FF',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  registerIcon: {
    width: 16,
    height: 16,
    tintColor: '#164194',
    marginRight: 8,
  },
  registerText: {
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 14,
    color: '#164194',
  },
  sectionTitle: {
    width: width * 0.9,
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 20,
    color: '#141D32',
    marginTop: 8,
    marginBottom: 12,
  },
  historyList: {
    width: width * 0.9,
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitle: {
    fontFamily: 'Rubik',
    fontWeight: '600',
    fontSize: 16,
    color: '#141D32',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyCol: {
    flexDirection: 'column',
  },
  historyLabel: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 12,
    color: '#788095',
  },
  historyValue: {
    fontFamily: 'Rubik',
    fontWeight: '600',
    fontSize: 14,
    color: '#141D32',
  },
  historyDate: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 12,
    color: '#141D32',
  },
  emptyStateContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyIconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 18,
    color: '#141D32',
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 14,
    color: '#788095',
    textAlign: 'center',
  }
});
