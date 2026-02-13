import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SecurityAlertProps {
    title: string;
    subtitle: string;
    buttonLabel: string;
    onPress: () => void;
    height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const SecurityAlert: React.FC<SecurityAlertProps> = ({
    title,
    subtitle,
    buttonLabel,
    onPress,
    height = 109,
}) => {
    return (
        <View
            style={[
                styles.container,
                { width: screenWidth * 0.9, height },
            ]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>

                <Image
                    source={require('../../assets/icons/WarningIconColor.png')}
                    style={{ width: 24, height: 24, marginRight: 8, marginTop: 30 }}
                    resizeMode="contain"
                />

                <View style={[styles.textContainer, { flex: 1 }]}>
                    <Text style={[styles.title, { marginBottom: 4 }]}>
                        {title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {subtitle}
                    </Text>
                </View>

            </View>

            <TouchableOpacity style={styles.button} onPress={onPress}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={require('../../assets/icons/AlertRestrictionIcon.png')}
                        style={{ width: 16, height: 16, marginRight: 6 }}
                        resizeMode="contain"
                    />

                    <Text style={styles.buttonText}>
                        {buttonLabel}
                    </Text>

                </View>
            </TouchableOpacity>

        </View>


    );
};

export default SecurityAlert;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF7E6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFA400',
        padding: 8,
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    textContainer: {
        gap: 4,
    },
    title: {
        color: '#FFA400',
        fontFamily: 'Rubik-SemiBold',
        fontWeight: '800',
        fontSize: 16,
        lineHeight: 16,
    },
    subtitle: {
        color: '#FFA400',
        fontFamily: 'Rubik-Regular',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 14,
    },
    button: {
        borderWidth: 1,
        borderColor: '#FFA400',
        borderRadius: 20,
        paddingVertical: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFA400',
        fontWeight: '600',
    },
});
