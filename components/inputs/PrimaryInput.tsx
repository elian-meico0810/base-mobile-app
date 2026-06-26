import { Dimensions, Platform, StyleSheet, TextInput, TextInputProps, useWindowDimensions } from "react-native";

interface PrimaryInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
}

export function PrimaryInput({ value, onChangeText, placeholder, error, ...rest }: PrimaryInputProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
  const { width } = Dimensions.get("window");
  const inputWidth = isTablet ? '100%' : width * 0.9;

  const handleChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const limitedText = numericText.slice(0, 10); 
    onChangeText(limitedText);
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder}
      style={[
        styles.input, 
        { width: inputWidth },
        isTablet && styles.inputTablet,
        error && styles.inputError
      ]}
      placeholderTextColor="#A0A0A0"
      keyboardType="numeric"
      maxLength={10} 
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D3D8',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    alignSelf: 'center',
    fontSize: 14,
    color: '#141D32',
  },
  inputTablet: {
    height: 50,
    fontSize: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: 'red',
  },
});