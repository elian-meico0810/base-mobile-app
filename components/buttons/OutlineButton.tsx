import { Image, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface OutlineButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function OutlineButton({
    title,
    onPress,
    disabled = false,
    width = 328,
    height = 32,
    style,
    textStyle
}: OutlineButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: disabled ? '#F5F5F5' : '#E8EEF9',
                    width,
                    height
                },
                style
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >

            <Image
                source={require("@/assets/icons/CameraIcon.png")}
                style={styles.iconCamera}
            />


            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 64,
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
        borderColor: '#E8EEF9',
    },
    iconCamera: {
        width: 14,
        height: 14,
        marginRight: 4,
        resizeMode: 'contain',
    },
    buttonText: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 14,
        textAlign: "center",
        color: '#164194',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});