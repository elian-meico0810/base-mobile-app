import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Animated, PanResponder, PanResponderInstance, StyleSheet, Text, View } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  titleColor?: string;
  buttonColor?: string;
  buttonColorEnd?: string;
  textCenter?: boolean;
  circleColor?: string;
  autoReset?: boolean;
}

export const PrimaryButtonDetails = forwardRef(
  (
    {
      title,
      onPress,
      disabled = false,
      width = 328,
      height = 44,
      titleColor = "#FFFFFF",
      buttonColor = "#164194",
      buttonColorEnd = "#0E2B68",
      circleColor = "#0E2B68",
      autoReset = false,
    }: PrimaryButtonProps,
    ref
  ) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [panResponder, setPanResponder] = useState<PanResponderInstance | null>(null);

    const reset = () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    };

    useImperativeHandle(ref, () => ({
      reset,
    }));

    useEffect(() => {
      const newPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          // Ampliar el área de respuesta
          return true;
        },
        onPanResponderMove: (_, gestureState) => {
          if (disabled) return;
          let newX = Math.max(0, Math.min(gestureState.dx, width - 56));
          pan.setValue({ x: newX, y: 0 });
        },
        onPanResponderRelease: (_, gestureState) => {
          if (disabled) {
            reset();
            return;
          }
          
          if (gestureState.dx > width / 2) {
            Animated.spring(pan, {
              toValue: { x: width - 56, y: 0 },
              useNativeDriver: false,
            }).start(async () => {
              try {
                await onPress();
              } catch (e) {
                if (autoReset) reset(); 
              }
            });
          } else {
            reset(); 
          }
        },
        onPanResponderTerminate: () => {
          if (!disabled) reset();
        },
      });

      setPanResponder(newPanResponder);
    }, [disabled, width, onPress, autoReset]);

    useEffect(() => {
      if (disabled) {
        reset();
      }
    }, [disabled]);

    if (!panResponder) {
      return (
        <View style={[styles.container, { width, height }]}>
          <View style={[styles.track, { width, height }]} />
          <View style={[styles.button, { width, height, backgroundColor: "#D9DCE5" }]}>
            <View style={styles.centerTextContainer}>
              <Text style={styles.buttonText}>{title}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { width, height }]}>
        <View style={[styles.track, { width, height }]} />

        {/* Capa del botón con el color de fondo */}
        <Animated.View
          style={[
            styles.button,
            {
              width,
              height,
              backgroundColor: disabled
                ? "#D9DCE5"
                : pan.x.interpolate({
                    inputRange: [0, width - 56],
                    outputRange: [buttonColor, buttonColorEnd],
                    extrapolate: "clamp",
                  }),
            },
          ]}
        >
          {/* Texto que cambia de color según la posición de la bolita */}
          <View style={styles.centerTextContainer}>
            <Animated.Text
              style={[
                styles.buttonText,
                {
                  color: pan.x.interpolate({
                    inputRange: [0, width - 56],
                    outputRange: [titleColor, buttonColor], // Cambia de blanco al color del botón
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              {title}
            </Animated.Text>
          </View>

          {/* Capa adicional que "cubre" el texto con el color de la bolita según la posición */}
          <Animated.View
            style={[
              styles.textMask,
              {
                width: pan.x.interpolate({
                  inputRange: [0, width - 56],
                  outputRange: [0, width], // Se expande según la posición
                  extrapolate: "clamp",
                }),
                backgroundColor: disabled ? "#A0A4B0" : circleColor, // Color de la bolita
              },
            ]}
          />

          {/* Contenedor más grande para el área sensible */}
          <Animated.View
            style={[
              styles.touchArea,
              {
                transform: [
                  {
                    translateX: pan.x.interpolate({
                      inputRange: [0, width - 56],
                      outputRange: [0, width - 56],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Flecha que se mueve */}
            <View style={[styles.arrowContainerInline, { 
              backgroundColor: disabled ? "#A0A4B0" : circleColor 
            }]}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

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
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  centerTextContainer: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  touchArea: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  arrowContainerInline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  textMask: {
    position: "absolute",
    height: "100%",
    left: 0,
    zIndex: 2, 
  },
});