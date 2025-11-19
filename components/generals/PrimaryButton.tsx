import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  width = 328,
  height = 50
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.button, { backgroundColor: disabled ? '#D9DCE5' : '#164194', width, height }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: "bold",
    fontSize: 16,
  },
});
