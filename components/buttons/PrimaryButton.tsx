import { Dimensions, DimensionValue, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: DimensionValue; 
  height?: number;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  width,
  height
}: PrimaryButtonProps) {
  const { width: windowWidth } = useWindowDimensions();
  
  const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
  
  const { width: screenWidth } = Dimensions.get("window");
  
  const responsiveWidth: DimensionValue = isTablet ? '100%' : screenWidth * 0.9;
  
  const finalWidth: DimensionValue = width !== undefined ? width : responsiveWidth;
  const finalHeight = height || (isTablet ? 56 : 50);

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { 
          backgroundColor: disabled ? '#D9DCE5' : '#164194', 
          width: finalWidth, 
          height: finalHeight,
          paddingVertical: isTablet ? 16 : 0,
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextTablet: {
    fontSize: 18,
  },
});