
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

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

    /** 🔥 Método para resetear la bolita */
    const reset = () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    };

    /** 🔥 Exponer reset() al padre */
    useImperativeHandle(ref, () => ({
      reset,
    }));

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onPanResponderMove: (_, gestureState) => {
          let newX = Math.max(0, Math.min(gestureState.dx, width - 56));
          pan.setValue({ x: newX, y: 0 });
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > width / 2) {
            Animated.spring(pan, {
              toValue: { x: width - 56, y: 0 },
              useNativeDriver: false,
            }).start(async () => {
              try {
                await onPress();
              } catch (e) {
                console.log("❌ Error en onPress:", e);
                if (autoReset) reset(); 
              }
            });
          } else {
            reset(); 
          }
        },
      })
    ).current;

    return (
      <View style={[styles.container, { width, height }]}>
        <View style={[styles.track, { width, height }]} />

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
          {/* 🔥 Texto centrado */}
          <View style={styles.centerTextContainer}>
            <Animated.Text
              style={[
                styles.buttonText,
                {
                  color: pan.x.interpolate({
                    inputRange: [0, width - 56],
                    outputRange: ["#FFFFFF", buttonColor],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              {title}
            </Animated.Text>
          </View>

          {/* 🔥 Flecha que se mueve */}
          <Animated.View
            style={{
              transform: [
                {
                  translateX: pan.x.interpolate({
                    inputRange: [0, width - 56],
                    outputRange: [0, width - 56],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
            {...panResponder.panHandlers}
          >
            <View style={[styles.arrowContainerInline, { backgroundColor: circleColor }]}>
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
  },
  centerTextContainer: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
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
  arrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
