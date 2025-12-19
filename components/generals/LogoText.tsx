import { ThemedText } from '@/components/themed-text';
import { StyleSheet, View } from 'react-native';

export const LogoText = ({ style }: { style?: any }) => (
    <View style={[styles.container, style]}>
        <ThemedText type="title" style={styles.meico}>
            MeiTruck
        </ThemedText>
    </View>
);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, 
        position: 'relative',
    },
    meico: {
        width: 158,
        height: 32,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    track: {
        width: 118,
        height: 21,
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 21,
        lineHeight: 21,
        opacity: 1,
    },
});

