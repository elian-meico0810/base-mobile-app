import React from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonLabel: string;
  showSettingsButton?: boolean;
  settingsButtonLabel?: string;
  onSettingsPress?: () => void;
  highlightText?: string;
  onConfirmation: () => void;

};

export const ExecptionModalValidate: React.FC<Props> = ({
  visible,
  onClose,
  title,
  message,
  buttonLabel,
  showSettingsButton = false,
  settingsButtonLabel = "Ir a Ajustes",
  onSettingsPress,
  highlightText,
  onConfirmation
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

  const handleButtonPress = () => {
    if (showSettingsButton) {
      handleSettingsPress();
    } else {
      onConfirmation();
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>

          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>{title}</Text>

              <Text style={styles.message}>
                {message}{' '}
                {highlightText && (
                  <Text style={styles.boldText}>
                    {highlightText}
                  </Text>
                )}
              </Text>

              <TouchableOpacity
                style={[styles.button, showSettingsButton && styles.settingsButton]}
                onPress={handleButtonPress}
              >
                <Text style={styles.buttonText}>
                  {showSettingsButton ? settingsButtonLabel : buttonLabel}
                </Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
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
  boldText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    width: '90%',
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
  button: {
    backgroundColor: '#164194',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  settingsButton: {
    backgroundColor: '#164194',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});