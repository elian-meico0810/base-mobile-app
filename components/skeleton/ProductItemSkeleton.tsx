import { Dimensions, StyleSheet, View } from "react-native";
const { width, height } = Dimensions.get('window');

export const ProductItemSkeleton = () => {
    return (
        <View style={styles.productContainer}>
            <View style={styles.productItem}>
                <View style={styles.productRow}>
                    
                    {/* Imagen */}
                    <View style={styles.imageContainer}>
                        <View style={styles.imageSkeleton} />
                    </View>

                    {/* Info */}
                    <View style={styles.productInfo}>
                        <View style={styles.row}>
                            <View style={styles.leftInfo}>
                                {/* Cantidad */}
                                <View style={[styles.skeleton, { width: 30, height: 14 }]} />

                                {/* Nombre */}
                                <View style={[styles.skeleton, { width: 180, height: 14, marginTop: 6 }]} />
                                <View style={[styles.skeleton, { width: 140, height: 14, marginTop: 4 }]} />

                                {/* Código */}
                                <View style={[styles.skeleton, { width: 80, height: 12, marginTop: 6 }]} />
                            </View>

                            {/* Precios */}
                            <View style={styles.priceRow}>
                                <View style={[styles.skeleton, { width: 70, height: 14 }]} />
                                <View style={[styles.skeleton, { width: 90, height: 12, marginTop: 6 }]} />
                            </View>
                        </View>
                    </View>

                </View>
            </View>

            <View style={styles.separator} />
        </View>
    );
};

const styles = StyleSheet.create({
    productContainer: {
        width: width,
    },
    productItem: {
        backgroundColor: "#F9F9FA",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    productRow: {
        flexDirection: "row",
    },
    imageContainer: {
        width: 64,
        height: 64,
        marginRight: 12,
    },
    imageSkeleton: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: "#E0E0E0",
    },
    productInfo: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    leftInfo: {
        flex: 1,
        paddingRight: 8,
    },
    priceRow: {
        alignItems: "flex-end",
    },
    skeleton: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    separator: {
        height: 1,
        backgroundColor: "#EDEDED",
    },
});
