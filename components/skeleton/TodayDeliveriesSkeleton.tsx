import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export const TodayDeliveriesSkeleton = () => {
    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
                <View style={[styles.skeletonText, { width: 40, height: 20 }]} />
            </View>
            <View style={[styles.skeletonText, { width: 150, height: 13, marginTop: 8 }]} />
            <View style={[styles.skeletonBar, { width: '100%', height: 6, marginTop: 5 }]} />
        </View>
    );
};

const styles = StyleSheet.create({
 card: {
        width: width * 0.9,
        height: height * 0.11,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        marginBottom: 16,
        alignSelf: "center",
        justifyContent: "flex-start",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    skeletonText: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonBar: {
        backgroundColor: "#E0E0E0",
        borderRadius: 100,
    },
});
