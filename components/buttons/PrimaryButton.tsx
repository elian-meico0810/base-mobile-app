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
  
  const finalMinHeight = height || (isTablet ? 56 : 50);

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { 
          backgroundColor: disabled ? '#D9DCE5' : '#164194', 
          width: finalWidth,
          minHeight: finalMinHeight, 
          paddingVertical: isTablet ? 14 : 12,
          paddingHorizontal: isTablet ? 24 : 16,
        }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.buttonText, 
          isTablet && styles.buttonTextTablet
        ]}
        numberOfLines={1} 
        adjustsFontSizeToFit 
        minimumFontScale={0.8}
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
    flexDirection: 'row',
    shadowColor: "#000",
  
  },
  buttonText: {
    color: '#fff',
    fontWeight: "bold",
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  buttonTextTablet: {
    fontSize: 20,
   
  },
});