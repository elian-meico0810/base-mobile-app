import { GuideState, TypeInvoiceEnum } from "@/src/constants/GuideStates";
import { GuideDetails, PaymentsByInvoice } from "@/src/features/tracking/domain/details/DetailsGuide";
import { formatNumber } from "@/src/utils/uitls";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { TodayDeliveriesSkeleton } from "../skeleton/TodayDeliveriesSkeleton";

const { width, height } = Dimensions.get("window");

interface TodayDeliveriesProps {
    style?: StyleProp<ViewStyle>;
    data?: GuideDetails[];
    routeStarted?: boolean;
    waitingForPermission?: boolean;
    dataResult?: PaymentsByInvoice | null;
}

export const TodayDeliveries = ({ style, data, routeStarted, waitingForPermission, dataResult }: TodayDeliveriesProps) => {
    const [showSummary, setShowSummary] = useState(false);
    const [circleAngle, setCircleAngle] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Calcular montos y valores de progreso
    const totalVisits = data?.length || 0;
    const completedVisits = data?.filter(item => item.estado === GuideState.Cerrada).length || 0;
    
    const totalValueTotal = data ? data.reduce((sum, item) => {
        const facturas = item.facturas || [];
        const subtotal = facturas
            .filter(f => f.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO)
            .reduce((fSum, f) => fSum + (f.valorTotal || 0), 0);
        return sum + subtotal;
    }, 0) : 0;

    const TotalAmountToCollect = dataResult?.total_pagado ?? 0;
    const totalPerRecaudar = Math.max(Number(totalValueTotal) - Number(TotalAmountToCollect), 0);
    
    // Calcular porcentaje de recaudo
    const progressRecaudo = totalValueTotal > 0 
        ? (TotalAmountToCollect / totalValueTotal) 
        : 0;
    
    // Determinar si está completo (100% recaudado)
    const isCompleteRecaudo = progressRecaudo >= 1 || totalPerRecaudar === 0;
    
    const progressVisits = totalVisits > 0 ? completedVisits / totalVisits : 0;
    const isCompleteVisits = progressVisits === 1;
    
    const circlePosition = Math.min(progressVisits * 100, 100);

    // Animación del círculo de progreso
    useEffect(() => {
        if (showSummary && !isAnimating) {
            setIsAnimating(true);
            // Usar progressRecaudo para la animación (0 a 360 grados)
            const finalAngle = Math.min(progressRecaudo * 360, 360);
            const duration = 1000;
            const steps = 60;
            const increment = finalAngle / steps;
            let currentAngle = 0;
            let step = 0;

            const animate = () => {
                if (step < steps) {
                    currentAngle += increment;
                    setCircleAngle(currentAngle);
                    step++;
                    setTimeout(animate, duration / steps);
                } else {
                    setCircleAngle(finalAngle);
                    setIsAnimating(false);
                }
            };

            animate();
        } else if (!showSummary) {
            setCircleAngle(0);
            setIsAnimating(false);
        }
    }, [showSummary, progressRecaudo]);

    // Obtener colores del círculo según el progreso - MODIFICADO PARA RELOJ
    const getCircleProgressStyle = () => {
        // Si no hay nada por recaudar o está completo - mostrar verde
        if (totalPerRecaudar === 0 || isCompleteRecaudo) {
            return {
                borderTopColor: "#1F9144",
                borderRightColor: "#1F9144",
                borderBottomColor: "#1F9144",
                borderLeftColor: "#1F9144",
                transform: [{ rotate: `${circleAngle}deg` }],
            };
        }

        // Si la diferencia es 0% del total (no se ha recaudado nada)
        if (TotalAmountToCollect === 0) {
            return {
                borderTopColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: "transparent",
                borderLeftColor: "transparent",
                transform: [{ rotate: `${circleAngle}deg` }],
            };
        }

        // Para diferentes niveles de progreso - RELOJ
        // Comienza desde arriba (12 en punto) y va en sentido horario
        const borderStyles: any = {
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
            transform: [{ rotate: `${circleAngle}deg` }],
        };

        // Determinar qué bordes mostrar según el ángulo
        if (circleAngle > 0) {
            // Siempre mostrar el borde superior cuando hay progreso
            borderStyles.borderTopColor = "#164194";
        }
        
        // Mostrar borde derecho cuando pasa de 90 grados
        if (circleAngle > 90) {
            borderStyles.borderRightColor = "#164194";
        }
        
        // Mostrar borde inferior cuando pasa de 180 grados
        if (circleAngle > 180) {
            borderStyles.borderBottomColor = "#164194";
        }
        
        // Mostrar borde izquierdo cuando pasa de 270 grados
        if (circleAngle > 270) {
            borderStyles.borderLeftColor = "#164194";
        }

        return borderStyles;
    };

    // Ajustar la animación para que comience desde -90 grados (12 en punto)
    const getAdjustedAngle = () => {
        // Ajustar el ángulo para que comience desde arriba
        return circleAngle;
    };

    const circleProgressStyle = getCircleProgressStyle();

    // Ajustar altura dinámica según el estado
    const dynamicHeight = height * (routeStarted ? (showSummary ? 0.30 : 0.15) : 0.11);
    const cardStyle = [
        styles.card,
        style,
        { height: dynamicHeight }
    ];

    // Mostrar skeleton mientras se carga
    if (!data || data.length === 0 || waitingForPermission) {
        return (
            <View style={[styles.card, style]}>
                <TodayDeliveriesSkeleton />
            </View>
        );
    }

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
                                <View style={styles.largeCircleContainer}>
                                    <View style={styles.circleBackground}>
                                        {/* Círculo base */}
                                        <View style={styles.circleBase} />

                                        {/* Círculo de progreso (azul) - SOLO cuando hay progreso */}
                                        {!isCompleteRecaudo && circleAngle > 0 && (
                                            <View
                                                style={[
                                                    styles.circleProgress,
                                                    circleProgressStyle
                                                ]}
                                            />
                                        )}

                                        {/* Círculo completo (verde) */}
                                        {isCompleteRecaudo && (
                                            <View
                                                style={[
                                                    styles.circleComplete,
                                                    { 
                                                        borderColor: "#1F9144",
                                                        transform: [{ rotate: `${circleAngle}deg` }]
                                                    }
                                                ]}
                                            />
                                        )}

                                        {/* Indicador del punto inicial (12 en punto) - OPCIONAL */}
                                        <View style={styles.startIndicator} />

                                        <View style={styles.circleContent}>
                                            <Text style={styles.largeCircleText}>
                                                ${formatNumber(totalPerRecaudar)}
                                            </Text>
                                            <Text style={styles.indicatorLabelCircle}>
                                                Por recaudar
                                            </Text>
                                            {/* Mostrar porcentaje de recaudo */}
                                            <Text style={styles.percentageText}>
                                                {Math.round(progressRecaudo * 100)}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.indicatorsContainer}>
                                    <View style={styles.indicatorItem}>
                                        <Text style={styles.indicatorLabel}>Total a recaudar</Text>
                                        <Text style={styles.indicatorValue}>
                                            ${formatNumber(totalValueTotal)}
                                        </Text>
                                    </View>

                                    <View style={styles.indicatorItem}>
                                        <Text style={styles.indicatorLabel}>Total recaudado</Text>
                                        <Text style={[styles.indicatorValue]}>
                                            ${formatNumber(TotalAmountToCollect)}
                                        </Text>
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
        borderTopWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
    },
    largeCircleContainer: {
        position: "absolute",
        left: width * 0.9 - 130,
        top: 16,
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
        textAlign: "center",
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
    percentageText: {
        fontSize: 9,
        color: "#6B7280",
        fontWeight: "600",
        marginTop: 2,
    },
    // Indicador del punto inicial (12 en punto)
    startIndicator: {
        position: "absolute",
        top: -3,
        left: 42,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#164194",
        zIndex: 3,
    },
});