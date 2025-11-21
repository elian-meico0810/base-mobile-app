import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const DetailsGudes = ({ style, guide, onExit }: { style?: any, guide?: number, onExit?: () => void }) => {
    const [dateText, setDateText] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            let horas = now.getHours();
            const minutos = now.getMinutes().toString().padStart(2, '0');
            const ampm = horas >= 12 ? 'pm' : 'am';
            horas = horas % 12;
            horas = horas === 0 ? 12 : horas;

            setDateText(`${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]}`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    const router = useRouter();

    const handleExit = async () => {
        // Eliminar token
        await SecureStore.deleteItemAsync('user_token');

        // Esperar 1.2 segundos y redirigir
        setTimeout(() => {
            router.replace('/auth/login');
        }, 1200);
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity style={styles.revertContainer} onPress={handleExit} activeOpacity={0.7}>
                <Image
                    source={require("@/assets/icons/Revert.png")}
                    style={styles.icon}
                />
                <ThemedText type="title" style={styles.revertText}>
                    Salir de ruta
                </ThemedText>
            </TouchableOpacity>

            <ThemedText type="title" style={styles.meico}>
                Ruta {guide}
            </ThemedText>

            <ThemedText type="default" style={styles.date}>
                {dateText}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
    },
    revertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -2,

    },
    revertText: {
        fontFamily: 'Rubik',
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 14,
        letterSpacing: -0.03 * 12,
        textAlign: 'center',
        color: '#FFFFFF',
        marginTop: -15,

    },
    meico: {
        width: '100%',
        color: '#FFFFFF',
        textAlign: 'left',
        marginRight: 180,
        marginTop: 8,
    },
    date: {
        marginTop: 1,
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'left',
        opacity: 0.9
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 4,
        marginTop: -15,
    },

});
