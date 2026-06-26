import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  DimensionValue,
  PanResponder,
  PanResponderInstance,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

interface PrimaryButtonDetailsProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: DimensionValue;
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
      width,
      height,
      titleColor = "#FFFFFF",
      buttonColor = "#164194",
      buttonColorEnd = "#0E2B68",
      circleColor = "#0E2B68",
      autoReset = false,
    }: PrimaryButtonDetailsProps,
    ref
  ) => {
    const { width: windowWidth } = useWindowDimensions();
    
    const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
    
    const { width: screenWidth } = Dimensions.get("window");
    
    const responsiveWidth: DimensionValue = isTablet ? '100%' : screenWidth * 0.9;
    
    const finalWidth = width !== undefined ? width : responsiveWidth;
    const finalHeight = height || (isTablet ? 56 : 50);
    
    // Convertir a número para cálculos
    const numericWidth = typeof finalWidth === 'number' ? finalWidth : screenWidth * 0.9;
    const numericHeight = finalHeight;

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
          return true;
        },
        onPanResponderMove: (_, gestureState) => {
          if (disabled) return;
          const circleSize = numericHeight;
          let newX = Math.max(0, Math.min(gestureState.dx, numericWidth - circleSize));
          pan.setValue({ x: newX, y: 0 });
        },
        onPanResponderRelease: (_, gestureState) => {
          if (disabled) {
            reset();
            return;
          }
          
          if (gestureState.dx > numericWidth / 2) {
            Animated.spring(pan, {
              toValue: { x: numericWidth - numericHeight, y: 0 },
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
    }, [disabled, numericWidth, numericHeight, onPress, autoReset]);

    useEffect(() => {
      if (disabled) {
        reset();
      }
    }, [disabled]);

    if (!panResponder) {
      return (
        <View style={[styles.container, { width: finalWidth, height: finalHeight }]}>
          <View style={[styles.track, { width: finalWidth, height: finalHeight }]} />
          <View style={[styles.button, { width: finalWidth, height: finalHeight, backgroundColor: "#D9DCE5" }]}>
            <View style={styles.centerTextContainer}>
              <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>{title}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { width: finalWidth, height: finalHeight }]}>
        <View style={[styles.track, { width: finalWidth, height: finalHeight }]} />

        <Animated.View
          style={[
            styles.button,
            {
              width: finalWidth,
              height: finalHeight,
              backgroundColor: disabled
                ? "#D9DCE5"
                : pan.x.interpolate({
                    inputRange: [0, numericWidth - numericHeight],
                    outputRange: [buttonColor, buttonColorEnd],
                    extrapolate: "clamp",
                  }),
            },
          ]}
        >
          <View style={styles.centerTextContainer}>
            <Animated.Text
              style={[
                styles.buttonText,
                isTablet && styles.buttonTextTablet,
                {
                  color: pan.x.interpolate({
                    inputRange: [0, numericWidth - numericHeight],
                    outputRange: [titleColor, buttonColor],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              {title}
            </Animated.Text>
          </View>

          <Animated.View
            style={[
              styles.textMask,
              {
                width: pan.x.interpolate({
                  inputRange: [0, numericWidth - numericHeight],
                  outputRange: [0, numericWidth],
                  extrapolate: "clamp",
                }),
                backgroundColor: disabled ? "#A0A4B0" : circleColor,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.touchArea,
              {
                transform: [
                  {
                    translateX: pan.x.interpolate({
                      inputRange: [0, numericWidth - numericHeight],
                      outputRange: [0, numericWidth - numericHeight],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={[styles.arrowContainerInline, { 
              backgroundColor: disabled ? "#A0A4B0" : circleColor,
              width: numericHeight,
              height: numericHeight,
              borderRadius: numericHeight / 2,
            }]}>
              <Text style={[styles.arrow, isTablet && styles.arrowTablet]}>→</Text>
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
    alignSelf: "center",
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
    color: '#fff',
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextTablet: {
    fontSize: 18,
  },
  touchArea: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  arrowContainerInline: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  arrowTablet: {
    fontSize: 22,
  },
  textMask: {
    position: "absolute",
    height: "100%",
    left: 0,
    zIndex: 2, 
  },
});