// ExitAppModal.tsx
import React from 'react';
import { BackHandler, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ExitAppModal: React.FC<Props> = ({ visible, onClose }) => {
  const handleExitApp = () => {
    BackHandler.exitApp(); // Cierra la aplicación
    onClose(); // Cierra el modal
  };

  const handleCancel = () => {
    onClose(); // Solo cierra el modal
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Salir</Text>
          <Text style={styles.message}>
            ¿Estás seguro de que quieres cerrar la aplicación?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.exitButton]} 
              onPress={handleExitApp}
            >
              <Text style={styles.exitButtonText}>Salir</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#164194',
  },
  exitButton: {
    backgroundColor: '#164194', 
  },
  cancelButtonText: {
    color: '#164194', 
    fontWeight: 'bold',
  },
  exitButtonText: {
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
});