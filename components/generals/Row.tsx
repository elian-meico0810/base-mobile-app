import { StyleSheet, Text, View } from "react-native";

export function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: "800", color: "#141D32" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: {
    color: "#141D32",
    fontSize: 14,
  },
  rowValue: {
    color: "#141D32",
    fontSize: 14,
    fontWeight: "600",
  },

});
