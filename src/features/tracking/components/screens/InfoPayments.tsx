import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InfoPaymentsProps {
    title: string;
    subTitle: string;
    description?: string;
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
    onPress,
    onClose,
    disabled = false,
    width = 360,
    height = 250,
}: InfoPaymentsProps) {
    return (
        <View style={styles.overlay}>
            {/* Fondo gris semi-transparente */}
            <TouchableOpacity 
                style={styles.backgroundOverlay} 
                onPress={onClose}
                activeOpacity={1}
            />
            
            {/* Panel de contenido */}
            <View style={[styles.container, { width, height }]}>
                {/* Fondo del panel */}
                <View style={[styles.track, { width, height }]} />

                {/* Botón de cerrar */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>

                {/* Título */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                </View>

                {/* Contenido centrado */}
                <View style={styles.content}>
                    <Text style={styles.subTitle}>{subTitle}</Text>
                    {description && <Text style={styles.description}>{description}</Text>}
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
        backgroundColor: "#FFFFFF",
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
});