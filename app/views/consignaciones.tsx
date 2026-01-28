import { ThemedView } from '@/components/themed-view';
import { formatNumber } from '@/src/utils/uitls';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type HistoryItem = {
  id: string;
  value: number;
  dateLabel: string;
};

const MOCK_HISTORY: HistoryItem[] = [
  { id: '0005', value: 250000, dateLabel: 'Nov 19, 2025 - 08:32 am' },
  { id: '0004', value: 250000, dateLabel: 'Nov 19, 2025 - 08:32 am' },
  { id: '0003', value: 250000, dateLabel: 'Nov 19, 2025 - 08:32 am' },
  { id: '0002', value: 250000, dateLabel: 'Nov 19, 2025 - 08:32 am' },
];

export default function ConsignacionesScreen() {
  const router = useRouter();
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
          <StatsCard />

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
          <View style={styles.historyList}>
            {MOCK_HISTORY.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
              />
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

function StatsCard() {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsLeft}>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>${formatNumber(100000000)}</Text>
          <Text style={styles.amountLabel}>Total efectivo recaudado</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>${formatNumber(89000000)}</Text>
          <Text style={styles.amountLabel}>Total consignado en ruta</Text>
        </View>
      </View>

      <View style={styles.donutContainer}>
        <View style={styles.donutRing} />
        <View style={styles.donutCenter}>
          <Text style={styles.donutValue}>$1.000.000</Text>
          <Text style={styles.donutLabel}>Por consignar</Text>
        </View>
      </View>
    </View>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
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
        <Text style={styles.historyValue}>${formatNumber(item.value)}</Text>
      </View>

      <View style={styles.historyRow}>
        <View style={styles.historyCol}>
          <Text style={styles.historyLabel}>Fecha</Text>
        </View>
        <Text style={styles.historyDate}>{item.dateLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Rubik',
    flex: 1,
    paddingTop: 16,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
});
