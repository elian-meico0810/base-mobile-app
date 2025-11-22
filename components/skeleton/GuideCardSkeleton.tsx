import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export const GuideCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.skeletonText, { width: 150, height: 14 }]} />
                    <View style={[styles.skeletonText, { width: 80, height: 12, marginTop: 4 }]} />
                </View>
                <View style={[styles.skeletonStatus, { width: 78, height: 31 }]} />
            </View>

            <View style={[styles.skeletonRow, { width: '80%', height: 12, marginTop: 8 }]} />
            <View style={[styles.skeletonRow, { width: '50%', height: 12, marginTop: 6 }]} />

            <View style={[styles.skeletonButton, { width: 303, height: 32, marginTop: 20 }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 328,
        height: 167,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#F0F1F5",
        padding: 12,
        marginBottom: 16,
        justifyContent: "flex-start",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    skeletonText: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonStatus: {
        backgroundColor: "#E0E0E0",
        borderRadius: 12,
    },
    skeletonRow: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonButton: {
        backgroundColor: "#E0E0E0",
        borderRadius: 64,
    },
});
