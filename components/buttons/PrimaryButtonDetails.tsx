import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function PrimaryButtonDetails({
  title,
  onPress,
  disabled = false,
  width = 328,
  height = 44,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? "#D9DCE5" : "#164194", width, height },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {/* Flecha a la izquierda */}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>

      {/* Texto centrado */}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  arrowContainer: {
    position: "absolute",
    left: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2B68",
    borderRadius: 22,
  },
  arrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
