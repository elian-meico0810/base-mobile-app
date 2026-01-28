import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { UploadPhotoItem } from '@/components/photo/uploadPhotoItem';
import { ThemedView } from '@/components/themed-view';
import { ConsignmentData } from '@/src/features/detailsInvoice/components/ConsignmentData';
import { Consignment, ConsignmentSummary } from '@/src/features/tracking/domain/consignments/Consignment';
import { consignmentRepositoryImpl } from '@/src/features/tracking/infrastructure/consignments/ConsignmentRepositoryImpl';
import { formatNumber } from '@/src/utils/uitls';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

const { width } = Dimensions.get('window');

export default function ConsignacionesScreen() {
  const router = useRouter();
  const { codigoGuia } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ConsignmentSummary | null>(null);

  // Modal states
  const [showViewConsignment, setViewConsignment] = useState(false);
  const [uploadPhoto, setUploadPhoto] = useState(false);
  const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
  const [valueInput, setValueInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleUploadFile = () => {
    setViewConsignment(false);
    setUploadPhoto(true);
  };

  const handleEvidenceComplete = (evidences: EvidencePhoto[]) => {
    setUploadPhoto(false);
    setMultiplePhotos(evidences);
    setViewConsignment(true);
  };

  const consignmentSubmit = async () => {
    try {
      // TODO: Integrate with backend to submit consignment
      setShowSuccess(true);
      setViewConsignment(false);
      setUploadPhoto(false);
    } catch (error: any) {
      setModalTitle("¡Error!");
      setModalMessage(error?.data?.message ?? "Ocurrio un error inesperado.");
      setModalVisible(true);
    }
  };

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
          headerStyle: { backgroundColor: '#F9F9FA' },
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

          <TouchableOpacity 
            style={styles.registerButton} 
            activeOpacity={0.8}
            onPress={() => setViewConsignment(true)}
          >
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

        {showViewConsignment && (
          <ConsignmentData
            title="Registrar consignación"
            subTitle="Ingresa el valor y adjunta una foto del comprobante."
            onClose={() => {
              setViewConsignment(false);
              setUploadPhoto(false);
              setValueInput("");
              setMultiplePhotos([]);
            }}
            width={width}
            visible={showViewConsignment}
            titleTwo="Comprobante de la consignación"
            onUploadFile={handleUploadFile}
            evidencePhotos={multiplePhotos}
            onValue={(value) => setValueInput(value)}
            value={valueInput}
            onConfirmation={consignmentSubmit}
          />
        )}

        {uploadPhoto && (
          <UploadPhotoItem
            title="Cargar evidencia"
            subTitle="Toma fotos de la mercancía ubicada en el cliente. Podrás asociar un máximo de 3 imágenes por entrega."
            onClose={() => {
              setUploadPhoto(false);
              setViewConsignment(true);
            }}
            width={width}
            onEvidenceComplete={handleEvidenceComplete}
            onPermisionsPhoto={() => {
              setUploadPhoto(false);
              setModalTitle("Permiso denegado ¡Alerta!");
              setModalMessage("No podemos acceder a la cámara. Activa el permiso en la configuración del dispositivo para continuar.");
              setModalVisible(true);
            }}
            onPermisionsGallery={() => {
              setUploadPhoto(false);
              setModalTitle("Permiso denegado ¡Alerta!");
              setModalMessage("No podemos acceder a la galería. Activa el permiso en la configuración del dispositivo para continuar.");
              setModalVisible(true);
            }}
            visible={uploadPhoto}
          />
        )}

        {showSuccess && (
          <TopSuccessAlert
            visible={showSuccess}
            message="Consignación registrada"
            onHide={() => setShowSuccess(false)}
            subtitle={`Se registró una consignación por el valor de $${valueInput}.`}
          />
        )}

        <ExceptionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalTitle}
          message={modalMessage}
          buttonLabel="Entendido"
        />
      </ThemedView>
    </>
  );
}

function StatsCard({ summary }: { summary: ConsignmentSummary }) {
  const total = summary.totalEfectivo > 0 ? summary.totalEfectivo : 1;
  const current = summary.totalConsignado;
  const percentage = Math.min(1, Math.max(0, current / total));

  const size = 92;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

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
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F9F9FA"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#164194"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
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
        <Svg width="18" 
            height="18" 
            viewBox="0 0 512 512"
            stroke="#141D32"
            strokeWidth={1}
            style={{ marginBottom: 4 }}>
          <Circle cx="256" cy="256" r="32" fill="#141D32" />
          <Circle cx="256" cy="416" r="32" fill="#141D32" />
          <Circle cx="256" cy="96" r="32" fill="#141D32" />
        </Svg>
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
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${day} ${month}, ${year} - ${hour}:${min} ${ampm}`;
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
    backgroundColor: '#F9F9FA',
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
    borderColor: '#F0F1F5',
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
    borderColor: '#F0F1F5',
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
    fontSize: 14,
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
    fontWeight: '400',
    fontSize: 12,
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
