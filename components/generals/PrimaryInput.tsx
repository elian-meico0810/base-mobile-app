import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface PrimaryInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function PrimaryInput({ value, onChangeText, placeholder, ...rest }: PrimaryInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={styles.input}
      placeholderTextColor="#A0A0A0"
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
});
