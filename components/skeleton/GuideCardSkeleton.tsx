import { Dimensions, Platform, StyleSheet, View, useWindowDimensions } from "react-native";

const { width } = Dimensions.get("window");

export const GuideCardSkeleton = () => {
    const { width: windowWidth } = useWindowDimensions();
    
    const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
    
    const cardWidth = width * 0.9;
    
    return (
        <View style={[styles.card, { width: cardWidth }]}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.skeletonText, { width: isTablet ? 200 : 150, height: isTablet ? 18 : 14 }]} />
                    <View style={[styles.skeletonText, { width: isTablet ? 100 : 80, height: isTablet ? 14 : 12, marginTop: 4 }]} />
                </View>
                <View style={[styles.skeletonStatus, { width: 78, height: 31 }]} />
            </View>

            <View style={[styles.skeletonRow, { width: '100%', height: isTablet ? 14 : 12, marginTop: 8 }]} />
            <View style={[styles.skeletonRow, { width: '60%', height: isTablet ? 14 : 12, marginTop: 6 }]} />

            <View style={[styles.skeletonButton, { width: '100%', height: 32, marginTop: 20 }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#F0F1F5",
        padding: 12,
        marginBottom: 16,
        justifyContent: "flex-start",
        alignSelf: "center",
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