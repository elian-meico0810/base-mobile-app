import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddEvidenceButtonProps {
    onPress?: () => void;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
    iconColor?: string;
    iconName?: keyof typeof Ionicons.glyphMap;    
    showStartIcon?: boolean;                         
    endIconName?: keyof typeof Ionicons.glyphMap;   
    showEndIcon?: boolean;                      
    spaced?: boolean;                              
}

export const AddEvidenceButton = ({
    onPress,
    title = "Agregar evidencia",
    backgroundColor = "#E8EEF9",
    textColor = "#003087",
    iconColor = "#003087",
    iconName = "camera-outline",
    showStartIcon = true,       
    endIconName = "refresh-outline",
    showEndIcon = false,       
    spaced = false,             
}: AddEvidenceButtonProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor },
                spaced && { justifyContent: "space-between" }  
            ]}
            onPress={onPress}
        >

            {/* IZQUIERDA: icono + texto */}
            <View style={styles.startContent}>
                {showStartIcon && (
                    <Ionicons name={iconName} size={18} color={iconColor} />
                )}

                <Text style={[styles.text, { color: textColor }]}>
                    {title}
                </Text>
            </View>

            {/* DERECHA: icono final */}
            {showEndIcon && (
                <Ionicons name={endIconName} size={18} color={iconColor} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',    
        borderRadius: 64,
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    startContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
    },
});
