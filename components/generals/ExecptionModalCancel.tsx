import React from 'react';
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  title: string;
  message: string;
  acceptButtonLabel?: string;
  cancelButtonLabel?: string;
  showSettingsButton?: boolean;
  settingsButtonLabel?: string;
  onSettingsPress?: () => void;
};

export const ExecptionModalCancel: React.FC<Props> = ({
  visible,
  onClose,
  onAccept,
  title,
  message,
  acceptButtonLabel = "Aceptar",
  cancelButtonLabel = "Cancelar",
  showSettingsButton = false,
  settingsButtonLabel = "Ir a Ajustes",
  onSettingsPress
}) => {

  const defaultSettingsPress = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      onClose();
    }
  };

  const handleSettingsPress = onSettingsPress || defaultSettingsPress;

  const handleAccept = () => {
    if (showSettingsButton) {
      handleSettingsPress();
    } else {
      onAccept();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.buttonsContainer}>

            {/* Cancelar */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>
                {cancelButtonLabel}
              </Text>
            </TouchableOpacity>

            {/* Aceptar */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleAccept}
            >
              <Text style={styles.buttonText}>
                {showSettingsButton
                  ? settingsButtonLabel
                  : acceptButtonLabel}
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  button: {
    backgroundColor: '#164194',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#164194',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cancelButtonText: {
    color: '#164194',
    fontWeight: 'bold',
  },
});