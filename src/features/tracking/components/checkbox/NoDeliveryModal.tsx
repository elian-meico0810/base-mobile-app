import { PrimaryButton } from "@/components/buttons/PrimaryButton";
// Usamos el tipo de causal NO_ENTREGA solicitado por backend
import { Cause } from "@/src/features/tracking/domain/details/DetailsGuide";
import { detailsRepositoryImpl } from "@/src/features/tracking/infrastructure/details/detailsRepositoryImpl";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NoDeliveryModalProps {
  token: string;
  onClose?: () => void;
  width?: number;
  height?: number;
  onContinue?: (cause: Cause) => void;
}

export function NoDeliveryModal({
  token,
  onClose,
  width = 360,
  height = 520,
  onContinue
}: NoDeliveryModalProps) {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [selected, setSelected] = useState<Cause | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (cause: Cause) => {
    setSelected(prev => prev?.codigo === cause.codigo ? null : cause);
  };

  const handleSubmit = () => {
    if (selected) {
      onClose?.();
      onContinue?.(selected);
    }
  };

  const loadCauses = async () => {
    try {
      setLoading(true);
      const response = await detailsRepositoryImpl.listTypeDetails("NO_ENTREGA", token);
      if (response?.statusCode === 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        setCauses(data);
      } else {
        setCauses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCauses();
  }, [token]);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backgroundOverlay} onPress={onClose} activeOpacity={1} />
      <View style={[styles.container, { width, height }]}>
        <View style={[styles.track, { width, height }]} />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        {/* Títulos fuera del ScrollView para que siempre sean visibles */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Motivo de la no entrega</Text>
          <Text style={styles.subTitle}>Selecciona una causal para continuar</Text>
        </View>
        <View style={styles.listContainer}>

          {/* ScrollView que envuelve TODAS las cápsulas y el botón */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {causes.map((cause, index) => (
              <TouchableOpacity
                key={`${cause.codigo}-${index}`}
                style={[
                  styles.item,
                  selected?.codigo === cause.codigo && styles.itemSelected
                ]}
                onPress={() => handleSelect(cause)}
                disabled={loading}
              >
                <View style={styles.itemRow}>
                  <View style={styles.itemTextBox}>
                    <Text style={styles.itemTitle}>{cause.nombre}</Text>
                    {cause.requiereEvidencia && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Este motivo requiere carga de evidencia</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.checkbox}>
                    {selected?.codigo === cause.codigo && <View style={styles.checkboxInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Botón dentro del ScrollView para que también sea desplazable si es necesario */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Continuar"
            onPress={handleSubmit}
            disabled={!selected}
            width={328}
            height={43}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 9999,
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
  position: "relative",
  padding: 16,
  zIndex: 10000,
  flexDirection: "column",
  },
  track: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#F9F9FA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    alignItems: "center",
    zIndex: 10001,
  },
  closeText: {
    color: "#788095",
    fontSize: 24,
    fontWeight: "300",
  },
  titleContainer: {
    marginBottom: 16,
    zIndex: 1,
  },
  title: {
    fontFamily: "Rubik",
    fontSize: 18,
    fontWeight: "800",
    color: "#141D32",
  },
  subTitle: {
    fontFamily: "Rubik",
    fontWeight: "400",
    fontSize: 14,
    marginTop: 8,
    color: "#4B5363",
  },
  scrollContent: {
    gap: 12,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  item: {
    width: "100%",
    minHeight: 56,
    backgroundColor: "#FFFFFF",
    borderColor: "#F0F1F5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  itemSelected: {
    borderColor: "#164194",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTextBox: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontFamily: "Rubik",
    fontWeight: "600",
    fontSize: 14,
    color: "#141D32",
  },
  tag: {
    marginTop: 8,
    width: "100%",
    height: 24,
    backgroundColor: "#E8EEF9",
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  tagText: {
    color: "#4F74C4",
    fontFamily: "Rubik",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#164194",
    borderRadius: 6,
  },
  buttonContainer: {
      alignItems: "center",
  paddingBottom: 34,
  },
  scrollView: {
    width: "100%",
  },

  listContainer: {
    flex: 1,
  width: "100%",
  marginBottom: 10,
  },
});