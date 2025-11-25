import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  width = 360,
  height = 50
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width,
          height,
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
});

