import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface AddEvidenceButtonProps {
    onPress?: () => void;
}

export const AddEvidenceButton = ({ onPress }: AddEvidenceButtonProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Ionicons name="camera-outline" size={18} color="#003087" />
            <Text style={styles.text}>Agregar evidencia</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E8EEF9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 64,
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    text: {
        color: '#003087',
        fontSize: 14,
        fontWeight: '600',
    },
    cameraIcon: {
        borderColor: '#003087',
        borderRadius: 3,
    },

});
