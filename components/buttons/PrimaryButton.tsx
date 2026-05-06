import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  width = 360,
  height = 50,
  fontSize = 16
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: disabled ? '#D9DCE5' : '#164194', width, height}]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, {fontSize: fontSize }]}>{title}</Text>
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
  },
});
