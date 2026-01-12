import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { SecondaryButtonCancel } from "../buttons/SecondaryButtonCancel";

interface ActionAllDataProps {
  title?: string;
  subTitle?: string;
  onClose?: () => void;
  width?: number;
  onConfirmation?: () => void;

}

export function ActionAllData({
  title,
  subTitle,
  onClose,
  width = 360,
  onConfirmation
}: ActionAllDataProps) {

  const handleSubmit = async () => {
    try {
      onConfirmation?.();
    } catch (error) {}
  };

  const handleClose = async () => {
    try {
      onClose?.();
    } catch (error) {
      throw error;
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Fondo oscuro */}
      <TouchableOpacity
        style={styles.backgroundOverlay}
        onPress={handleClose}
        activeOpacity={1}
      />

      {/* Contenedor principal */}
      <View style={[styles.container, { width }]}>

        {/* Contenido superior */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          {subTitle && (
            <Text style={styles.subTitleLabel}>{subTitle}</Text>
          )}
        </View>

        {/* Footer gris */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Confirmar"
            onPress={handleSubmit}
            disabled={false}
            width={328}
            height={43}
          />

          <View style={{ marginTop: 12 }}>
            <SecondaryButtonCancel
              title="Cancelar"
              onPress={handleClose}
              disabled={false}
              width={328}
              height={43}
            />
          </View>
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
    zIndex: 100,
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontFamily: "Rubik",
    fontSize: 22,
    fontWeight: "700",
    color: "#141D32",
    marginBottom: 8,
  },
  subTitleLabel: {
    fontFamily: "Rubik",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 18,
    color: "#788095",
    marginBottom: 25,
  },
  footer: {
    backgroundColor: "#F9F9FA",
    paddingTop: 20,
    paddingBottom: 60,
    alignItems: "center",
    borderTopColor: "#E6E8EC",
  },
});
