import { GuideState } from "@/src/constants/GuideStates";
import { GuideDetails } from "@/src/features/tracking/domain/details/DetailsGuide";
import React from "react";
import { Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

const { width, height } = Dimensions.get("window");

interface TodayDeliveriesProps {
    style?: StyleProp<ViewStyle>;
    data: GuideDetails[];
}

export const TodayDeliveries = ({ style, data }: TodayDeliveriesProps) => {

    const totalVisits = data.length
    const totalVisitsPending =  data.filter(item => item.estado === GuideState.Pendiente).length; 
    const completedVisits = data.filter(item => item.estado === GuideState.Cerrada).length; 

    const progress = totalVisits > 0 ? completedVisits / totalVisits : 0; 

    return (
        <View style={[styles.card, style]}>
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

            <Text style={styles.summaryLink}>Ver resumen de recaudos ▼</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: width * 0.9,
        height: height * 0.15,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
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
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
    },
    progressPercent: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 8,
        marginBottom: 8,
    },
    progressBackground: {
        width: "100%",
        height: 6,
        backgroundColor: "#F9F9FA",
        borderRadius: 100,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#164194",
        borderRadius: 100,
    },
    summaryLink: {
        marginTop: 12,
        fontSize: 14,
        color: "#164194",
        alignSelf: "center",
    },
});
