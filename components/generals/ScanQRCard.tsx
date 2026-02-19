import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

interface Props {
    onScan: () => void;
    height?: number;
}

export const ScanQRCard = ({ 
    onScan, 
    height = 109,
}: Props) => {
    return (
        <View style={[styles.card, { width: screenWidth * 0.9 }]}>
            <View style={styles.header}>
                <MaterialIcons name="check-circle" size={24} color="#1F9144" style={styles.checkIcon} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Cuadrar ruta</Text>
                    <Text style={styles.subtitle}>
                        Escanea el código QR del CEDI para finalizar tu ruta.
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={onScan} activeOpacity={0.7}>
                <Ionicons name="qr-code-outline" size={16} color="#1F9144" />
                <Text style={styles.buttonText}>Escanear QR</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#EAF7ED",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1F9144",
        padding: 8,
        alignSelf: "center",
        marginBottom: 16,
        gap: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    checkIcon: {
        alignSelf: "flex-start",
        marginTop: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: "700",
        fontSize: 14,
        color: "#1F9144",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#1F9144",
        lineHeight: 18,
    },
    button: {
        backgroundColor: "#EAF7ED",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 32,
        borderRadius: 64,
        borderWidth: 1,
        borderColor: "#1F9144",
        gap: 4,
        paddingHorizontal: 16,
    },
    buttonText: {
        color: "#1F9144",
        fontWeight: "600",
        fontSize: 12,
    },
});