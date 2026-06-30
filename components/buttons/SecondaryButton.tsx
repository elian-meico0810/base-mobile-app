import {
  Dimensions,
  DimensionValue,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions
} from "react-native";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: DimensionValue;
  height?: number;
}

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  width,
  height,
}: SecondaryButtonProps) {
  const { width: windowWidth } = useWindowDimensions();
  
  const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
  
  const { width: screenWidth } = Dimensions.get("window");
  
  const responsiveWidth: DimensionValue = isTablet ? '100%' : screenWidth * 0.92;
  
  const finalWidth = width !== undefined ? width : responsiveWidth;
  const finalHeight = height || (isTablet ? 56 : 50);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: finalWidth,
          height: finalHeight,
          backgroundColor: disabled ? "#F2F3F7" : "#FFFFFF",
          borderColor: disabled ? "#A5ACC1" : "#164194",
        }
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          isTablet && styles.buttonTextTablet,
          { color: disabled ? "#A5ACC1" : "#164194" }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextTablet: {
    fontSize: 18,
  },
});