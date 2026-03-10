import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export const GuideDetailSkeleton = () => {
  return (
    <View style={styles.container}>

      {/* Card documento */}
      <View style={styles.card}>
        <View style={styles.storeText}>
          <View style={[styles.skeletonText, { width: 220, height: 16 }]} />
          <View style={[styles.skeletonText, { width: 90, height: 12, marginTop: 6 }]} />
        </View>
      </View>

      {/* Lista pedidos */}
      <View style={styles.secondCardTwo}>

        {/* Pedido skeleton */}
        {[1,2,3].map((item) => (
          <View key={item} style={styles.secondCard}>

            {/* Header pedido */}
            <View style={styles.orderHeader}>
              <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
              <View style={[styles.skeletonText, { width: 90, height: 14 }]} />
            </View>

            <View style={styles.divider} />

            {/* Productos skeleton */}
            <View style={styles.gap}>
              {[1,2,3].map((prod) => (
                <View key={prod} style={styles.productRow}>
                  <View style={[styles.skeletonText, { width: 180, height: 12 }]} />
                  <View style={[styles.skeletonText, { width: 40, height: 12 }]} />
                </View>
              ))}
            </View>

          </View>
        ))}

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    alignItems: "center",
    marginTop: 10
  },

  card: {
    width: 360,
    height: 69,
    backgroundColor: "#FFFFFF",
    borderColor: "#F0F1F5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    justifyContent: "center"
  },

  secondCardTwo: {
    width: width,
    padding: 10,
    marginTop: 4
  },

  secondCard: {
    width: 360,
    backgroundColor: "#FFFFFF",
    borderColor: "#F0F1F5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    gap: 12
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  gap: {
    gap: 8
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB"
  },

  storeText: {
    alignItems: "center"
  },

  skeletonText: {
    backgroundColor: "#E5E7EB",
    borderRadius: 4
  }
});