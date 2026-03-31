import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { ThemedView } from "../themed-view";

const { width, height } = Dimensions.get("window");

export const DeliveryOrderSkeleton = () => {
    return (
        <ThemedView style={styles.container}>
            <NetworkStatus />

            {/* Fondo gris */}
            <View style={styles.background} />

            {/* Header con título */}
            <View style={styles.headerContainer}>
                <View style={styles.backButton}>
                    <View style={[styles.skeletonBackArrow, styles.skeletonBase]} />
                </View>
                <View style={[styles.skeletonHeaderTitle, styles.skeletonBase]} />
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Card principal - Skeleton */}
                <View style={styles.card}>
                    {/* Encabezado del card */}
                    <View style={styles.cardHeader}>
                        <View style={[styles.skeletonStatus, { width: 73, height: 28, borderRadius: 12 }]} />
                    </View>

                    {/* Información del minimercado */}
                    <View style={styles.merchantInfo}>
                        <View style={[styles.skeletonText, { width: 200, height: 20, marginBottom: 8 }]} />
                        <View style={[styles.skeletonText, { width: 120, height: 16, marginBottom: 8 }]} />
                        <View style={[styles.skeletonText, { width: '90%', height: 14 }]} />
                    </View>

                    {/* Línea divisoria y detalles de factura */}
                    <View style={styles.orderInfo}>
                        <View style={styles.divider} />
                        
                        {/* Método de pago */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 80, height: 14 }]} />
                        </View>
                        
                        {/* N° de factura */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 80, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
                        </View>
                        
                        <View style={styles.divider} />
                        
                        {/* Subtotal */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 70, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 90, height: 14 }]} />
                        </View>
                        
                        {/* Descuento financiero */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 120, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 80, height: 14 }]} />
                        </View>
                        
                        {/* Total */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 50, height: 16 }]} />
                            <View style={[styles.skeletonText, { width: 100, height: 16 }]} />
                        </View>

                        <View style={styles.dividerTwo} />

                        {/* Valor recaudado */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 90, height: 14 }]} />
                        </View>

                        {/* Valor a recaudar */}
                        <View style={styles.row}>
                            <View style={[styles.skeletonText, { width: 100, height: 16 }]} />
                            <View style={[styles.skeletonText, { width: 100, height: 16 }]} />
                        </View>

                        {/* Botón Generar QR de pago */}
                        <View style={[styles.skeletonQRButton, { width: '100%', height: 32, marginTop: 12 }]} />
                        
                        {/* Botón Detalle de pagos */}
                        <View style={[styles.skeletonQRButtonDetail, { width: '100%', height: 32, marginTop: 12 }]} />
                    </View>
                </View>

                {/* Título Estado de entrega */}
                <View style={styles.headerContainerTwo}>
                    <View style={[styles.skeletonText, { width: 150, height: 20 }]} />
                </View>

                {/* Skeleton para DeliveryStatus */}
                <View style={styles.deliveryStatusSkeleton}>
                    {/* Opciones de estado */}
                    <View style={styles.statusOptions}>
                        <View style={[styles.skeletonStatusOption, styles.skeletonBase]} />
                        <View style={[styles.skeletonStatusOption, styles.skeletonBase]} />
                        <View style={[styles.skeletonStatusOption, styles.skeletonBase]} />
                    </View>
                    
                    {/* Botón de carga de evidencia */}
                    <View style={[styles.skeletonButton, { width: '100%', height: 48, marginTop: 16, borderRadius: 8 }]} />
                    
                </View>
            </ScrollView>

        </ThemedView>
    );
};

// Componente NetworkStatus simulado para el skeleton
const NetworkStatus = () => {
    return <View style={{ height: 0 }} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        alignItems: 'center',
        backgroundColor: '#F9F9FA',
    },
    background: {
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: '#F9F9FA',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 5,
        backgroundColor: '#F9F9FA',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    skeletonBackArrow: {
        width: 24,
        height: 32,
        borderRadius: 4,
    },
    skeletonHeaderTitle: {
        width: 150,
        height: 24,
        borderRadius: 4,
        marginLeft: 0,
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
        width: '100%',
        marginTop: 0,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 100,
        paddingTop: 8,
    },
    card: {
        width: 360,
        minHeight: 368,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 5,
        shadowColor: "#000",
        marginTop: 1,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 4,
    },
    merchantInfo: {
        alignItems: 'center',
        marginBottom: 0,
        gap: 8,
    },
    orderInfo: {
        gap: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
        marginVertical: 2,
    },
    dividerTwo: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        borderStyle: 'dotted',
        width: '100%',
        marginVertical: 4,
    },
    headerContainerTwo: {
        width: '100%',
        backgroundColor: '#F9F9FA',
        marginTop: 15,
        paddingLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryStatusSkeleton: {
        width: 360,
        backgroundColor: "#FFFFFF",
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 8,
        padding: 16,
    },
    statusOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    skeletonStatusOption: {
        width: 80,
        height: 36,
        borderRadius: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 45,
        width: '100%',
        alignItems: 'center',
    },
    skeletonBase: {
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
    skeletonText: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonStatus: {
        backgroundColor: "#E0E0E0",
        borderRadius: 12,
    },
    skeletonQRButton: {
        backgroundColor: "#E0E0E0",
        borderRadius: 16,
    },
    skeletonQRButtonDetail: {
        backgroundColor: "#E0E0E0",
        borderRadius: 16,
    },
    skeletonButton: {
        backgroundColor: "#E0E0E0",
    },
    skeletonFooterButton: {
        backgroundColor: "#E0E0E0",
    },
});