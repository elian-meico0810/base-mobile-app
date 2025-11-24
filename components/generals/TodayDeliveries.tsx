import { GuideState } from "@/src/constants/GuideStates";
import { GuideDetails } from "@/src/features/tracking/domain/details/DetailsGuide";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { TodayDeliveriesSkeleton } from "../skeleton/TodayDeliveriesSkeleton";

const { width, height } = Dimensions.get("window");

interface TodayDeliveriesProps {
    style?: StyleProp<ViewStyle>;
    data?: GuideDetails[]; // opcional para poder mostrar skeleton
    routeStarted?: boolean

}

export const TodayDeliveries = ({ style, data, routeStarted }: TodayDeliveriesProps) => {

    if (!data || data.length === 0) {
        return (
            <View style={[styles.card, style]}>
                <TodayDeliveriesSkeleton />
            </View>
        );
    }
    const cardStyle = [
        styles.card,
        style,
        { height: height * (routeStarted ? 0.15 : 0.11) } // altura dinámica
    ];

    const totalVisits = data.length;
    const totalVisitsPending = data.filter(item => item.estado === GuideState.Pendiente).length;
    const completedVisits = data.filter(item => item.estado === GuideState.Cerrada).length;

    const progress = totalVisits > 0 ? completedVisits / totalVisits : 0;

    return (
        <View style={cardStyle}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Entregas de hoy</Text>
                <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            </View>

            <Text style={styles.subtitle}>
                {completedVisits} de {totalVisitsPending} visitas
            </Text>

            <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            {routeStarted && (
                <TouchableOpacity style={styles.summaryButton}>
                    <View style={styles.summaryButtonContent}>
                        <Text style={styles.summaryButtonText}>Ver resumen de recaudos</Text>
                        <Ionicons
                            name="chevron-down"
                            size={16}
                            color="#164194"
                            style={{ marginLeft: 4, alignSelf: "center" }}
                        />
                    </View>
                </TouchableOpacity>
            )}
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
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
    },
    progressPercent: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
    },
    subtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 8,
    },
    progressBackground: {
        width: "100%",
        height: 6,
        backgroundColor: "#F9F9FA",
        borderRadius: 100,
        overflow: "hidden",
        marginTop: 5,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#164194",
        borderRadius: 100,
    },
    skeletonText: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonBar: {
        backgroundColor: "#E0E0E0",
        borderRadius: 100,
    },
    summaryButton: {
        marginTop: 12,
    },
    summaryButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    summaryButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#164194",
    },


});
