import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export const OrderDetailSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Primer card - Información de la tienda */}
            <View style={styles.card}>
                <View style={styles.orderInfo}>
                    {/* Store row skeleton */}
                    <View style={styles.storeRow}>
                        <View style={[styles.skeletonIcon, { width: 24, height: 24 }]} />
                        <View style={styles.storeText}>
                            <View style={[styles.skeletonText, { width: 120, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 160, height: 16, marginTop: 4 }]} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Dirección skeleton */}
                    <View style={styles.storeRow}>
                        <View style={[styles.skeletonIcon, { width: 24, height: 24 }]} />
                        <View style={styles.storeText}>
                            <View style={[styles.skeletonText, { width: 70, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 200, height: 16, marginTop: 4 }]} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Código cliente skeleton */}
                    <View style={styles.storeRow}>
                        <View style={[styles.skeletonIcon, { width: 24, height: 24 }]} />
                        <View style={styles.storeText}>
                            <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 80, height: 16, marginTop: 4 }]} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Método de pago skeleton */}
                    <View style={styles.storeRow}>
                        <View style={[styles.skeletonIcon, { width: 24, height: 24 }]} />
                        <View style={styles.storeText}>
                            <View style={[styles.skeletonText, { width: 110, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 90, height: 16, marginTop: 4 }]} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* N° factura skeleton */}
                    <View style={styles.storeRow}>
                        <View style={[styles.skeletonIcon, { width: 24, height: 24 }]} />
                        <View style={styles.storeText}>
                            <View style={[styles.skeletonText, { width: 85, height: 14 }]} />
                            <View style={[styles.skeletonText, { width: 75, height: 16, marginTop: 4 }]} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Segundo card - Información de pagos */}
            <View style={[styles.cardTwo]}>
                {/* Encabezado con status */}
                <View style={styles.cardHeader}>
                    <View style={[styles.skeletonStatus, { width: 100, height: 28 }]} />
                </View>

                <View style={styles.orderInfo}>
                    {/* Subtotal skeleton */}
                    <View style={styles.row}>
                        <View style={[styles.skeletonText, { width: 60, height: 16 }]} />
                        <View style={[styles.skeletonText, { width: 80, height: 16 }]} />
                    </View>

                    {/* Descuento skeleton */}
                    <View style={styles.row}>
                        <View style={[styles.skeletonText, { width: 120, height: 16 }]} />
                        <View style={[styles.skeletonText, { width: 80, height: 16 }]} />
                    </View>

                    {/* Productos rechazados skeleton */}
                    <View style={styles.row}>
                        <View style={[styles.skeletonText, { width: 140, height: 16 }]} />
                        <View style={[styles.skeletonText, { width: 80, height: 16 }]} />
                    </View>

                    {/* Valor total skeleton */}
                    <View style={styles.row}>
                        <View style={[styles.skeletonText, { width: 80, height: 18 }]} />
                        <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
                    </View>

                    <View style={styles.dividerTwo} />

                    {/* Valor recaudado skeleton */}
                    <View style={styles.row}>
                        <View style={[styles.skeletonText, { width: 100, height: 16 }]} />
                        <View style={[styles.skeletonText, { width: 90, height: 16 }]} />
                    </View>

                    {/* Valor a recaudar skeleton */}
                    <View style={styles.row}>
                        <View style={[styles.skeletonText, { width: 110, height: 18 }]} />
                        <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
                    </View>

                    {/* Botón skeleton */}
                    <View style={[styles.skeletonButton, { width: '100%', height: 32, marginTop: 12 }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        alignItems: 'center',
        paddingTop: 1,
    },
    card: {
        width: '92%',
        maxWidth: 400,
        minHeight: 300,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 16,
        paddingHorizontal: '4%',
        gap: 5,
        shadowColor: "#000",
        marginTop: 1,
        alignSelf: 'center',
    },
    cardTwo: {
        width: '92%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 16,
        paddingHorizontal: '4%',
        gap: 5,
        shadowColor: "#000",
        marginTop: 10,
        alignSelf: 'center',
        minHeight: 229,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 4,
    },
    orderInfo: {
        gap: 5,
    },
    storeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    storeText: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
        marginVertical: 2,
        marginTop: 12,
    },
    dividerTwo: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        borderStyle: 'dotted',
        width: '100%',
        marginVertical: 4,
    },
    skeletonIcon: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonText: {
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    skeletonStatus: {
        backgroundColor: "#E0E0E0",
        borderRadius: 12,
    },
    skeletonButton: {
        backgroundColor: "#E0E0E0",
        borderRadius: 16,
    },
});