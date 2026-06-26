import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

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
    disabled?: boolean;
    height?: number;
    width?: number;
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
    disabled = false,
    height,
    width,
}: AddEvidenceButtonProps) => {
    const { width: windowWidth } = useWindowDimensions();
    const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
    const { width: screenWidth } = Dimensions.get("window");
    
    // Calcular ancho responsivo
    const responsiveWidth = isTablet ? '100%' : screenWidth * 0.92;
    const finalWidth = width !== undefined ? width : responsiveWidth;
    
    // Calcular altura responsiva
    const defaultHeight = isTablet ? 48 : 40;
    const finalHeight = height !== undefined ? height : defaultHeight;

    return (
        <TouchableOpacity
            disabled={disabled}
            style={[
                styles.container,
                { 
                    backgroundColor,
                    width: finalWidth,
                    height: finalHeight,
                },
                spaced && styles.spacedContainer,
                disabled && styles.disabledContainer,
            ]}
            onPress={onPress}
        >
            {/* IZQUIERDA: icono + texto */}
            <View style={styles.startContent}>
                {showStartIcon && (
                    <Ionicons 
                        name={iconName} 
                        size={isTablet ? 20 : 18} 
                        color={iconColor} 
                    />
                )}

                <Text style={[
                    styles.text, 
                    { color: textColor },
                    isTablet && styles.textTablet
                ]}>
                    {title}
                </Text>
            </View>

            {/* DERECHA: icono final */}
            {showEndIcon && (
                <Ionicons 
                    name={endIconName} 
                    size={isTablet ? 20 : 18} 
                    color={iconColor} 
                />
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
        alignSelf: 'center',
    },
    spacedContainer: {
        justifyContent: 'space-between',
    },
    disabledContainer: {
        opacity: 0.6,
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
    textTablet: {
        fontSize: 16,
    },
});