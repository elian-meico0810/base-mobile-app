import { CameraView, useCameraPermissions } from 'expo-camera';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onRead: (value: string) => void;
}

export function QRScanner({ visible, onClose, onRead }: Props) {
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission?.granted) {
        requestPermission();
        return null;
    }

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={(e) => {
                        onRead(e.data);
                        onClose();
                    }}
                />

                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                        <Text style={styles.backText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
    },

    backBtn: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },

    backText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

});
