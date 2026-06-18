import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface PrimaryInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
}

export function PrimaryInput({ value, onChangeText, placeholder, error, ...rest }: PrimaryInputProps) {
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
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor="#A0A0A0"
      keyboardType="numeric"
      maxLength={10} 
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: 328,
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

  inputError: {
    borderColor: 'red',
  },
});