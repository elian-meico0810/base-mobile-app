import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Interface basada en la estructura exacta del JSON
interface PaymentItem {
    id: number;
    numeroDeposito: string;
    fechaDeposito: string;
    valorPagado: string;
    canal: string;
    numeroDocumento: string;
    estado: string;
    referencia: string;
}

interface InfoPaymentsProps {
    title: string;
    subTitle: string;
    description?: string;
    payments?: PaymentItem[];
    onPress?: () => void;
    onClose?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
}

export function InfoPayments({
    title,
    subTitle,
    description,
    payments = [],
    onPress,
    onClose,
    disabled = false,
    width = 360,
    height = 726,
}: InfoPaymentsProps) {

    // Función para formatear la fecha
    const formatFecha = (fechaString: string): string => {
        try {
            const fecha = new Date(fechaString);
            // Nombres de meses en inglés (abreviados)
            const meses = [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ];

            const año = fecha.getFullYear();
            const mes = meses[fecha.getMonth()];
            const dia = fecha.getDate();

            // Formatear la hora en formato 12h con AM/PM
            let horas = fecha.getHours();
            const minutos = fecha.getMinutes().toString().padStart(2, '0');
            const ampm = horas >= 12 ? 'pm' : 'am';

            horas = horas % 12;
            horas = horas === 0 ? 12 : horas;

            return `${mes} ${dia}, ${año} - ${horas}:${minutos} ${ampm}`;

        } catch (error) {
            return fechaString;
        }
    };


    const cardHeight = 180;
    const dynamicHeight = Math.min(726, Math.max(250, payments.length * cardHeight + 120));

    return (
        <View style={styles.overlay}>
            {/* Fondo gris semi-transparente */}
            <TouchableOpacity
                style={styles.backgroundOverlay}
                onPress={onClose}
                activeOpacity={1}
            />

            {/* Panel de contenido */}
            <View style={[styles.container, { width, height: dynamicHeight }]}>

                {/* Fondo del panel */}
                <View style={[styles.track, { width, height: dynamicHeight }]} />

                {/* Botón de cerrar */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>

                {/* Título */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                </View>

                {/* SI NO HAY PAGOS → Mostrar subtítulo y descripción */}
                {payments.length === 0 && (
                    <View style={styles.content}>
                        <Text style={styles.subTitle}>{subTitle}</Text>
                        {description && <Text style={styles.description}>{description}</Text>}
                    </View>
                )}

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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
        position: "relative",
        padding: 16,
        marginBottom: 0,
        zIndex: 10000,
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
        fontSize: 14,
        fontWeight: "bold",
    },
    titleContainer: {
        marginBottom: 20,
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 18,
        fontWeight: "800",
        color: "#141D32",
        textAlign: "left",
    },

    content: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
    },

    subTitle: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "800",
        color: "#788095",
        textAlign: "center",
        marginBottom: 5,
    },

    description: {
        fontFamily: "Rubik",
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 12,
        color: "#788095",
        textAlign: "center",
    },
    card: {
        width: "100%",
        maxWidth: 328,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#E6E8EC",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 14,
        backgroundColor: "#FFFFFF",
    },
   
});