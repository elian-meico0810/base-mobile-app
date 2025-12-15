import { GuideState } from "@/src/constants/GuideStates";
import { GuideDetails } from "@/src/features/tracking/domain/details/DetailsGuide";
import { formatNumber } from "@/src/utils/uitls";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { TodayDeliveriesSkeleton } from "../skeleton/TodayDeliveriesSkeleton";

const { width, height } = Dimensions.get("window");

interface TodayDeliveriesProps {
    style?: StyleProp<ViewStyle>;
    data?: GuideDetails[]; // opcional para poder mostrar skeleton
    routeStarted?: boolean;
    waitingForPermission?: boolean;
}

export const TodayDeliveries = ({ style, data, routeStarted, waitingForPermission }: TodayDeliveriesProps) => {
    const [showSummary, setShowSummary] = useState(false);

    if (!data || data.length === 0 || waitingForPermission) {
        return (
            <View style={[styles.card, style]}>
                <TodayDeliveriesSkeleton />
            </View>
        );
    }

    // AUMENTAR LA ALTURA cuando se muestra el resumen
    const dynamicHeight = height * (routeStarted ? (showSummary ? 0.30 : 0.15) : 0.11);

    const cardStyle = [
        styles.card,
        style,
        {
            height: dynamicHeight,
        }
    ];

    const totalVisits = data.length;
    const totalVisitsPending = data.filter(item => item.estado === GuideState.Pendiente).length;
    const completedVisits = data.filter(item => item.estado === GuideState.Cerrada).length;

    // Calcular montos
    const totalValueTotal = data.reduce((sum, item) => {
        const facturas = item.facturas || [];
        const subtotal = facturas.reduce((fSum, f) => fSum + (f.valorTotal || 0), 0);
        return sum + subtotal;
    }, 0);

    const TotalAmountToCollect = data.reduce((sum, item) => {
        const facturas = item.facturas || [];
        const subtotal = facturas.reduce((fSum, f) => fSum + (f.valorRecaudar || 0), 0);
        return sum + subtotal;
    }, 0);

    const totalPerRecaudar = Number(TotalAmountToCollect) - Number(totalValueTotal);

    // Calcular porcentaje de recaudo
    const progressVisits = totalVisits > 0 ? completedVisits / totalVisits : 0;
    const isCompleteVisits = progressVisits === 1;

    // Calcular porcentaje de recaudo
    const progressRecaudo = TotalAmountToCollect > 0 ? totalValueTotal / TotalAmountToCollect : 0;
    const isCompleteRecaudo = progressRecaudo === 1 || totalPerRecaudar === 0; // 100% recaudado o 0 por recaudar

    // Calcular ángulo para el círculo de progreso (en grados)
    const circleAngle = progressRecaudo * 360;

    // Calcular la posición del círculo para visitas
    const circlePosition = Math.min(progressVisits * 100, 100);

    return (
        <View style={cardStyle}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Entregas de hoy</Text>
                <Text style={styles.progressPercent}>{Math.round(progressVisits * 100)}%</Text>
            </View>

            <Text style={styles.subtitle}>
                {completedVisits} de {totalVisits} visitas
            </Text>

            <View style={styles.progressBarContainer}>
                <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, {
                        width: `${progressVisits * 100}%`,
                        backgroundColor: isCompleteVisits ? "#1F9144" : "#164194",
                    }]} />
                </View>
                <View style={[
                    styles.progressCircle,
                    {
                        borderColor: isCompleteVisits ? "#1F9144" : "#164194",
                        left: `${circlePosition}%`,
                        transform: [{ translateX: -8 }],
                    }
                ]}>
                    <View style={styles.progressCircleInner} />
                </View>
            </View>

            {routeStarted && (
                <>
                    {!showSummary ? (
                        <TouchableOpacity
                            style={styles.summaryButton}
                            onPress={() => setShowSummary(true)}
                        >
                            <View style={styles.summaryButtonContent}>
                                <Text style={styles.summaryButtonText}>
                                    Ver resumen de recaudos
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={16}
                                    color="#164194"
                                    style={{ marginLeft: 4, alignSelf: "center" }}
                                />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <View style={styles.summaryContainer}>
                                {/* Círculo de progreso grande CON PROGRESO CIRCULAR */}
                                <View style={styles.largeCircleContainer}>
                                    <View style={styles.circleBackground}>
                                        {/* Círculo de fondo (gris) - siempre visible */}
                                        <View style={styles.circleBase} />

                                        {/* Círculo de progreso (azul) - usando transform rotate */}
                                        {!isCompleteRecaudo && (
                                            <View
                                                style={[
                                                    styles.circleProgress,
                                                    {
                                                        borderTopColor: "#164194",
                                                        transform: [{ rotate: `${circleAngle}deg` }],
                                                    }
                                                ]}
                                            />
                                        )}

                                        {/* Círculo completo verde si es 100% */}
                                        {isCompleteRecaudo && (
                                            <View
                                                style={[
                                                    styles.circleComplete,
                                                    {
                                                        borderColor: "#1F9144",
                                                    }
                                                ]}
                                            />
                                        )}

                                        {/* Contenido del círculo */}
                                        <View style={styles.circleContent}>
                                            <Text style={styles.largeCircleText}>
                                                ${totalPerRecaudar.toLocaleString()}
                                            </Text>
                                            <Text style={styles.indicatorLabelCircle}>
                                                Por recaudar
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Indicadores de recaudos */}
                                <View style={styles.indicatorsContainer}>
                                    <View style={styles.indicatorItem}>
                                        <Text style={styles.indicatorLabel}>Total a recaudar</Text>
                                        <Text style={styles.indicatorValue}>${formatNumber(TotalAmountToCollect)}</Text>
                                    </View>

                                    <View style={styles.indicatorItem}>
                                        <Text style={styles.indicatorLabel}>Total recaudado</Text>
                                        <Text style={styles.indicatorValue}>${formatNumber(totalValueTotal)}</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.hideSummaryButton}
                                onPress={() => setShowSummary(false)}
                            >
                                <View style={styles.summaryButtonContent}>
                                    <Text style={styles.summaryButtonText}>
                                        Ocultar resumen de recaudos
                                    </Text>
                                    <Ionicons
                                        name="chevron-up"
                                        size={16}
                                        color="#164194"
                                        style={{ marginLeft: 4, alignSelf: "center" }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    card: {
        width: width * 0.9,
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
    progressBarContainer: {
        position: "relative",
        width: "100%",
        marginTop: 5,
        height: 16,
    },
    progressBackground: {
        width: "100%",
        height: 6,
        backgroundColor: "#F9F9FA",
        borderRadius: 100,
        overflow: "hidden",
        position: "absolute",
        top: 5,
    },
    progressFill: {
        height: "100%",
        borderRadius: 100,
    },
    progressCircle: {
        position: "absolute",
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    progressCircleInner: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
    },
    subtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 8,
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
    summaryContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
    },
    largeCircleContainer: {
        position: "absolute",
        left: width * 0.9 - 130,
        top: 16,
    },
    largeCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 6,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F9FA",
    },
    largeCircleText: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 12,
        color: "#1F2937",
        textAlign: "center",
    },

    indicatorsContainer: {
        marginLeft: 0,
    },
    indicatorItem: {
        marginBottom: 12,
    },
    indicatorLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2,
    },
    indicatorValue: {
        fontSize: 16,
        fontFamily: "Rubik",
        fontWeight: "800",
        color: "#1F2937",
    },
    indicatorLabelCircle: {
        fontSize: 10,
        color: "#6B7280",
        marginBottom: 2,
        fontWeight: "400",
    },
    circleContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    hideSummaryButton: {
        alignSelf: 'center',
        width: '100%',
    },
    circleBackground: {
        width: 90,
        height: 90,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    circleBase: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 6,
        borderColor: "#E5E7EB", 
        backgroundColor: "#F9F9FA",
    },
    circleProgress: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 6,
        borderLeftColor: "transparent",
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
        transformOrigin: "center",
    },
    circleComplete: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 6,
        borderColor: "#1F9144",
        zIndex: 2,
    },

});