import React from "react";
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
    if (numericText.length > 10) return;
    onChangeText(numericText);
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder}
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor="#A0A0A0"
      keyboardType="numeric"
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: 328,
    height: 43,
    borderWidth: 1,
    borderColor: '#D1D3D8',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    alignSelf: 'center',
    fontSize: 14,
  },
  inputError: {
    borderColor: 'red',
  },
});
