import { TopSuccessAlert } from '@/components/alerts/TopSuccessAlert';
import { ActionAllData } from '@/components/generals/ActionAllData';
import { ExceptionModal } from '@/components/generals/ExecptionModal';
import { UploadPhotoItem } from '@/components/photo/uploadPhotoItem';
import { ThemedView } from '@/components/themed-view';
import { ConsignmentData } from '@/src/features/detailsInvoice/components/ConsignmentData';
import { ConsignmentEditModal } from '@/src/features/detailsInvoice/components/ConsignmentEditModal';
import { ConsignmentOptionsModal } from '@/src/features/detailsInvoice/components/ConsignmentOptionsModal';
import { Consignment, ConsignmentSummary, EditConsignmentRequest } from '@/src/features/tracking/domain/consignments/Consignment';
import { consignmentRepositoryImpl } from '@/src/features/tracking/infrastructure/consignments/ConsignmentRepositoryImpl';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import { createDataUri, formatNumber, formatStringToNumber, getDeviceDateTime } from '@/src/utils/uitls';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { statusConsignment } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ConsignmentSummary | null>(null);
  const [rutaId, setRutaId] = useState<number | null>(null);
  // Modal states
  const [showViewConsignment, setViewConsignment] = useState(statusConsignment ? true : false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadPhoto, setUploadPhoto] = useState(false);
  const [multiplePhotos, setMultiplePhotos] = useState<EvidencePhoto[]>([]);
  const [editPhotos, setEditPhotos] = useState<EvidencePhoto[]>([]);
  const [valueInput, setValueInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadContext, setUploadContext] = useState<"register" | "edit" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptEvidenceUrl, setReceiptEvidenceUrl] = useState<string | null>(null);
  const [sasToken, setSasToken] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync("service_token");
      setSasToken(token || "");
    };
    loadToken();
  }, []);

  const handleUploadFile = () => {
    setUploadContext("register");
    setViewConsignment(false);
    setUploadPhoto(true);
  };

  const handleEvidenceComplete = (evidences: EvidencePhoto[]) => {
    setUploadPhoto(false);
    if (uploadContext === "register") {
      setMultiplePhotos(evidences);
      setViewConsignment(true);
    } else if (uploadContext === "edit") {
      setEditPhotos(evidences);
      setShowEditModal(true);
    }
    setUploadContext(null);
  };

  const handleEditSave = async (amount: string, evidences: EvidencePhoto[]) => {
    try {
      if (!selectedConsignment) {
        setShowEditModal(false);
        setModalTitle("¡Error!");
        setModalMessage("No se encontró la consignación seleccionada.");
        setModalVisible(true);
        return;
      }

      if (!amount) {
        setModalTitle("¡Alerta!");
        setModalMessage("Debe ingresar un valor para la consignación.");
        setModalVisible(true);
        return;
      }

      setIsEditing(true);
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) {
        setIsEditing(false);
        setModalTitle("¡Error!");
        setModalMessage("No se encontró el token de autenticación.");
        setModalVisible(true);
        return;
      }

      const evidencesData = evidences
        .map(p => {
          if (p.base64) {
            return createDataUri(p.base64, p.uri);
          }
          return "";
        })
        .filter(e => e !== "");

      const valorConsignado = formatStringToNumber(amount);

      const payload: EditConsignmentRequest = {
        rutaId: selectedConsignment.rutaId,
        valorConsignado: valorConsignado,
        fechaHoraDispositivo: getDeviceDateTime(),
      };

      if (evidencesData.length > 0) {
        payload.evidencias = evidencesData;
      }

      await consignmentRepositoryImpl.editConsignment(selectedConsignment.id, payload, token);

      setIsEditing(false);
      setShowEditModal(false);
      setEditPhotos([]);
      setShowEditSuccess(true);
      fetchSummary();
    } catch (error: any) {
      setIsEditing(false);
      setModalTitle("¡Error!");
      const errorMessage = error?.response?.data?.message ?? "Ocurrió un error inesperado al actualizar la consignación.";
      setModalMessage(errorMessage);
      setModalVisible(true);
    }
  };

  const handleEditUploadFile = () => {
    setUploadContext("edit");
    setShowEditModal(false);
    setUploadPhoto(true);
  };

  const handleOptionsPress = (item: Consignment) => {
    setSelectedConsignment(item);
    setShowOptionsModal(true);
  };

  const handleDeleteConsignment = async () => {
    try {
      if (!selectedConsignment) {
        setShowDeleteModal(false);
        setModalTitle("¡Error!");
        setModalMessage("No se encontró la consignación seleccionada.");
        setModalVisible(true);
        return;
      }

      setIsDeleting(true);
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setModalTitle("¡Error!");
        setModalMessage("No se encontró el token de autenticación.");
        setModalVisible(true);
        return;
      }

      await consignmentRepositoryImpl.deleteConsignment(selectedConsignment.id, token);

      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedConsignment(null);
      setShowDeleteSuccess(true);
      fetchSummary();
    } catch (error: any) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setModalTitle("¡Error!");
      const errorMessage = error?.response?.data?.message ?? "Ocurrió un error inesperado al eliminar la consignación.";
      setModalMessage(errorMessage);
      setModalVisible(true);
    }
  };

  const consignmentSubmit = async () => {
    try {
      if (!rutaId) {
        setModalTitle("¡Alerta!");
        setModalMessage("No se ha podido identificar la ruta. Por favor, intente nuevamente.");
        setModalVisible(true);
        return;
      }

      if (!valueInput) {
        setModalTitle("¡Alerta!");
        setModalMessage("Debe ingresar un valor para la consignación.");
        setModalVisible(true);
        return;
      }

      if (multiplePhotos.length === 0) {
        setModalTitle("¡Alerta!");
        setModalMessage("Debe adjuntar al menos una evidencia.");
        setModalVisible(true);
        return;
      }

      setIsSubmitting(true);
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) {
        setIsSubmitting(false);
        setModalTitle("¡Error!");
        setModalMessage("No se encontró el token de autenticación.");
        setModalVisible(true);
        return;
      }

      // Prepare evidences with data URI
      const evidences = multiplePhotos.map(p => {
        // If base64 is already present, use it. Otherwise assume uri is local and we might need to read it?
        // ConsignmentData seems to just store uri. 
        // We need to ensure we have base64 or can create it.
        // Assuming the photo component provides base64 or we handle it.
        // If p.base64 is present, create data URI.
        if (p.base64) {
          return createDataUri(p.base64, p.uri);
        }
        // If no base64, we might have a problem if the API expects base64 data URI.
        // The UploadPhotoItem component usually provides base64.
        return "";
      }).filter(e => e !== "");

      if (evidences.length === 0) {
        setIsSubmitting(false);
        setModalTitle("¡Alerta!");
        setModalMessage("Error al procesar las evidencias. Asegúrese de que las fotos se hayan cargado correctamente.");
        setModalVisible(true);
        return;
      }

      const valorConsignado = formatStringToNumber(valueInput);

      await consignmentRepositoryImpl.registerConsignment({
        rutaId: rutaId,
        valorConsignado: valorConsignado,
        fechaHoraDispositivo: getDeviceDateTime(),
        evidencias: evidences
      }, token);

      setIsSubmitting(false);
      setShowSuccess(true);
      setViewConsignment(false);
      setUploadPhoto(false);
      setValueInput("");
      setMultiplePhotos([]);

      // Refresh summary
      fetchSummary();

    } catch (error: any) {
      setIsSubmitting(false);
      setModalTitle("¡Error!");
      const errorMessage = error?.response?.data?.message ?? "Ocurrio un error inesperado al registrar la consignación.";
      setModalMessage(errorMessage);
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
      if (!token || !codigoGuia) {
        setLoading(false);
        return;
      }

      // Fetch Route ID if not set
      if (!rutaId) {
        try {
          const routeResponse = await detailsRepositoryImpl.listRouteByCodeGuide(Number(codigoGuia), token);
          if (routeResponse && routeResponse.success && routeResponse.data) {
            const routeData = routeResponse.data as any;
            if (routeData.id) {
              setRutaId(Number(routeData.id));
            }
          }
        } catch (e) {
          console.error("Error fetching route ID", e);
        }
      }

      const data = await consignmentRepositoryImpl.getSummary(String(codigoGuia), token);
      setSummary(data);
    } catch (error) {
      console.error(error);
      setModalTitle("¡Error!");
      setModalMessage("No se pudo cargar el resumen de consignaciones.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

        <View
          style={{
            flex: 1,
            backgroundColor: '#F9F9FA',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#164194" />
        </View>
      </>
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
                  onPressOptions={handleOptionsPress}
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
              if (!isSubmitting) {
                setViewConsignment(false);
                setUploadPhoto(false);
                setValueInput("");
                setMultiplePhotos([]);
              }
            }}
            width={width}
            visible={showViewConsignment}
            titleTwo="Comprobante de la consignación"
            onUploadFile={handleUploadFile}
            evidencePhotos={multiplePhotos}
            onValue={(value) => setValueInput(value)}
            value={valueInput}
            onConfirmation={consignmentSubmit}
            isLoading={isSubmitting}
          />
        )}

        {showOptionsModal && (
          <ConsignmentOptionsModal
            visible={showOptionsModal}
            onClose={() => setShowOptionsModal(false)}
            consignment={selectedConsignment}
            onEdit={(item) => {
              setShowOptionsModal(false);
              setShowEditModal(true);
            }}
            onViewReceipt={(item) => {
              if (item.evidencias && item.evidencias.length > 0) {
                const baseUrl = item.evidencias[0].url;
                const fullUrl = sasToken ? `${baseUrl}${sasToken}` : baseUrl;
                setReceiptEvidenceUrl(fullUrl);
                setShowReceiptModal(true);
              } else {
                setModalTitle("¡Alerta!");
                setModalMessage("Esta consignación no tiene comprobantes disponibles.");
                setModalVisible(true);
              }
            }}
            onDelete={(item) => {
              setSelectedConsignment(item);
              setShowOptionsModal(false);
              setShowDeleteModal(true);
            }}
          />
        )}

        {showEditModal && (
          <ConsignmentEditModal
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditPhotos([]);
            }}
            consignment={selectedConsignment}
            onSave={handleEditSave}
            width={width}
            onUploadFile={handleEditUploadFile}
            evidencePhotos={editPhotos}
            isLoading={isEditing}
          />
        )}

        {showReceiptModal && selectedConsignment && (
          <Modal
            transparent
            visible={showReceiptModal}
            animationType="slide"
            onRequestClose={() => setShowReceiptModal(false)}
          >
            <View style={styles.receiptOverlay}>
              <View style={styles.receiptContainer}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptTitle}>
                    {`Consignación #${selectedConsignment.id.toString()}`}
                  </Text>
                  <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                    <Ionicons name="close" size={24} color="#788095" />
                  </TouchableOpacity>
                </View>

                {receiptEvidenceUrl && (
                  <Image
                    source={{ uri: receiptEvidenceUrl }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                )}

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    if (receiptEvidenceUrl) {
                      Linking.openURL(receiptEvidenceUrl);
                    }
                  }}
                >
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color="#164194"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.downloadButtonText}>Descargar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {showDeleteModal && selectedConsignment && (
          <ActionAllData
            title="¿Estás seguro de que deseas eliminar la consignación?"
            onClose={() => {
              if (!isDeleting) {
                setShowDeleteModal(false);
              }
            }}
            width={width}
            onConfirmation={handleDeleteConsignment}
          />
        )}

        {uploadPhoto && (
          <UploadPhotoItem
            title="Cargar evidencia"
            subTitle="Toma foto del comprobante entregado en el punto de recaudo. Podrás adjuntar un máximo de 1 imagen."
            onClose={() => {
              setUploadPhoto(false);
              if (uploadContext === "register") {
                setViewConsignment(true);
              }
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

        {showEditSuccess && (
          <TopSuccessAlert
            visible={showEditSuccess}
            message="Consignación actualizada"
            onHide={() => setShowEditSuccess(false)}
            subtitle="La consignación se actualizó correctamente."
          />
        )}

        {showDeleteSuccess && (
          <TopSuccessAlert
            visible={showDeleteSuccess}
            message="Consignación eliminada"
            onHide={() => setShowDeleteSuccess(false)}
            subtitle="La consignación se eliminó correctamente."
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
  const efectivoNeto = Math.max(0, summary.totalEfectivo - summary.totalConsignado);

  const size = 92;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <View style={styles.statsCard}>
      <View style={styles.statsLeft}>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>${formatNumber(efectivoNeto)}</Text>
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

function HistoryCard({ item, onPressOptions }: { item: Consignment; onPressOptions: (item: Consignment) => void }) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Consignación #{item.id}</Text>
        <TouchableOpacity onPress={() => onPressOptions(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
        </TouchableOpacity>
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
  },
  receiptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  receiptContainer: {
    width: width,
    backgroundColor: '#F9F9FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 55,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  receiptTitle: {
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 20,
    color: '#141D32',
  },
  receiptImage: {
    width: '100%',
    aspectRatio: 572 / 768,
    borderRadius: 8,
    marginBottom: 24,
  },
  downloadButton: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#164194',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontFamily: 'Rubik',
    fontWeight: '700',
    fontSize: 16,
    color: '#164194',
  }
});
