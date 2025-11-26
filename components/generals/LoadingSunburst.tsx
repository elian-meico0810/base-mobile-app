import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export const LoadingSunburst = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 900,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animation.start();

        return () => animation.stop();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ rotate }] }}>
                <View style={styles.spinner}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.bar,
                                {
                                    transform: [
                                        { rotate: `${i * 45}deg` },
                                        { translateY: -10 } 
                                    ],
                                },
                            ]}
                        />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        width: 26,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bar: {
        position: 'absolute',
        width: 3,
        height: 8,
        backgroundColor: '#164194',
        borderRadius: 2,
    },
});
