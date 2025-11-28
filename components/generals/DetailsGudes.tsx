import { ThemedText } from '@/components/themed-text';
import { StatusInvoice } from '@/src/constants/GuideStates';
import { formatTime } from '@/src/utils/uitls';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const DetailsGudes = ({ style, guide, onExit, date, routeStarted, statusName }: { style?: any, guide?: number, onExit?: () => void, date?: string, routeStarted?: boolean, statusName?: string }) => {
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

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity style={styles.revertContainer} onPress={onExit} activeOpacity={0.7}>
                <Image
                    source={require("@/assets/icons/Revert.png")}
                    style={styles.icon}
                />
                <ThemedText type="title" style={styles.revertText}>
                    Salir de ruta
                </ThemedText>


            </TouchableOpacity>

            <View style={styles.routeRow}>
                <ThemedText type="title" style={styles.meico}>
                    Ruta {guide}
                </ThemedText>
                <View
                    style={[
                        styles.statusContainer,
                       ( (statusName != StatusInvoice.PENDING) &&( routeStarted)) && { backgroundColor: '#DFF5E1' }
                    ]}
                >
                    <Text
                        style={[
                            styles.status,
                            (statusName != StatusInvoice.PENDING) && { color: '#1F9144' }
                        ]}
                    >
                        {statusName ?? null}
                    </Text>
                </View>

            </View>


            <ThemedText type="default" style={styles.date}>
                {date ? formatTime(date) : dateText}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        width: '100%',
        paddingHorizontal: 18,
    },
    revertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    revertText: {
        fontFamily: 'Rubik',
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 14,
        letterSpacing: -0.03 * 12,
        textAlign: 'center',
        color: '#FFFFFF',
        marginTop: -15,

    },
    meico: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        color: '#FFFFFF',
    },
    date: {
        marginTop: 1,
        color: '#FFFFFF',
        fontSize: 15,
        textAlign: 'left',
        opacity: 0.9
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 4,
        marginTop: -15,
    },
    routeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 8,
    },
    statusContainer: {
        backgroundColor: '#E8EEF9',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: 78,
        height: 31,
        justifyContent: 'center',
        alignItems: 'center',
    },

    status: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#4F74C4',
    },

});
