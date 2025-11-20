import { ThemedText } from '@/components/themed-text';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export const DetailsGudes = ({ style, guide }: { style?: any, guide?: number }) => {

    const [dateText, setDateText] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();

            const dias = [
                'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
            ];
            const meses = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];

            let horas = now.getHours();
            const minutos = now.getMinutes().toString().padStart(2, '0');
            const ampm = horas >= 12 ? 'pm' : 'am';
            horas = horas % 12;
            horas = horas === 0 ? 12 : horas;

            const textoFormateado = `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]} - ${horas}:${minutos} ${ampm}`;

            setDateText(textoFormateado);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={[styles.container, style]}>
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
        justifyContent: 'center',
        alignItems: 'flex-start', 
        zIndex: 10,
    },
    meico: {
        width: '100%', 
        color: '#FFFFFF',
        textAlign: 'left', 
        fontSize: 32,
        lineHeight: 32,
        marginRight: 180
    },
    track: {
        width: '100%',
        color: '#FFFFFF',
        textAlign: 'left',
        fontSize: 20,
        marginTop: -6,
    },
    date: {
        marginTop: 4,
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'left', 
        opacity: 0.9
    }
});

