import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SecondaryButtonCancelProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function SecondaryButtonCancel({
  title,
  onPress,
  disabled = false,
  width = 360,
  height = 50
}: SecondaryButtonCancelProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: '#FFFFFF',
          width,
          height,
          borderWidth: 1.5,
          borderColor: '#164194',
          opacity: disabled ? 0.5 : 1
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
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
    color: '#164194',
    fontWeight: "bold",
    fontSize: 16,
  },
});
