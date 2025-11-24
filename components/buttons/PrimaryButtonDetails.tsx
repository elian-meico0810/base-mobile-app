import React, { useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function PrimaryButtonDetails({
  title,
  onPress,
  disabled = false,
  width = 328,
  height = 44,
}: PrimaryButtonProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onPanResponderMove: (e, gestureState) => {
        let newX = Math.max(0, Math.min(gestureState.dx, width - 44 - 12));
        pan.setValue({ x: newX, y: 0 });
      },

      onPanResponderRelease: (e, gestureState) => {
        // Si arrastra más de la mitad, se considera "completado"
        if (gestureState.dx > width / 2) {
          Animated.spring(pan, {
            toValue: { x: width - 44, y: 0 }, // extremo derecho menos tamaño de flecha
            useNativeDriver: false,
          }).start(() => onPress()); // ejecutar acción al llegar
        } else {
          // Vuelve al inicio
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Track de fondo */}
      <View style={[styles.track, { width, height }]} />

      {/* Botón arrastrable */}
      <Animated.View
        style={[
          styles.button,
          {
            width,
            height,
            backgroundColor: disabled
              ? "#D9DCE5"
              : pan.x.interpolate
                ? pan.x.interpolate({
                  inputRange: [0, width - 44 - 12],
                  outputRange: ["#164194", "#0E2B68"],
                  extrapolate: "clamp",
                })
                : "#164194",
          },
        ]}
      >

        {/* Contenido arrastrable */}
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            transform: [
              {
                translateX: pan.x.interpolate
                  ? pan.x.interpolate({
                    inputRange: [0, width - 44 - 12], 
                    outputRange: [0, width - 44 - 12],
                    extrapolate: "clamp",
                  })
                  : 0,
              },
            ],
          }}
          {...panResponder.panHandlers}
        >
          <View style={styles.arrowContainerInline}>
            <Text style={styles.arrow}>→</Text>
          </View>
          <Text style={[styles.buttonText, { marginLeft: 10 }]}>{title}</Text>
        </Animated.View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 20,
  },
  track: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#E8EEF9",
    borderRadius: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  arrowContainer: {
    position: "absolute",
    left: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2B68",
    borderRadius: 22,
  },
  arrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  arrowContainerInline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0E2B68",
    justifyContent: "center",
    alignItems: "center",
  },
});
