import React from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonLabel: string;
  showSettingsButton?: boolean;
  settingsButtonLabel?: string;
  onSettingsPress?: () => void;
};

export const ExceptionModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  buttonLabel,
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
  
  const handleButtonPress = () => {
    if (showSettingsButton) {
      handleSettingsPress();
    } else {
      onClose();
    }
  };
  
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          {/* Botón único con texto dinámico */}
          <TouchableOpacity
            style={[styles.button, showSettingsButton && styles.settingsButton]}
            onPress={handleButtonPress}
          >
            <Text style={styles.buttonText}>
              {showSettingsButton ? settingsButtonLabel : buttonLabel}
            </Text>
          </TouchableOpacity>
          
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
  button: {
    backgroundColor: '#164194',
    paddingVertical: 10,
    paddingHorizontal: 30,
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