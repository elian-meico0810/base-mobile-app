import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export const OrderDetailSkeletonSelect = () => {
    return (
        <View style={styles.container}>
            {/* Card principal - Información del minimercado */}
            <View style={styles.card}>
                {/* Status skeleton */}
                <View style={styles.cardHeader}>
                    <View style={[styles.skeletonStatus, { width: 100, height: 28 }]} />
                </View>

                {/* Información del merchant */}
                <View style={styles.merchantInfo}>
                    <View style={[styles.skeletonText, { width: 200, height: 20, marginBottom: 4 }]} />
                    <View style={[styles.skeletonText, { width: 120, height: 16, marginBottom: 4 }]} />
                    <View style={[styles.skeletonText, { width: 250, height: 16 }]} />
                </View>

                {/* Línea divisoria */}
                <View style={styles.divider} />

                {/* Órdenes a entregar */}
                <View style={styles.row}>
                    <View style={[styles.skeletonText, { width: 120, height: 16 }]} />
                    <View style={[styles.skeletonText, { width: 40, height: 16 }]} />
                </View>

                {/* Valor total del pedido */}
                <View style={styles.row}>
                    <View style={[styles.skeletonText, { width: 140, height: 16 }]} />
                    <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
                </View>

                <View style={styles.divider} />

                {/* Valor recaudado */}
                <View style={styles.row}>
                    <View style={[styles.skeletonText, { width: 110, height: 16 }]} />
                    <View style={[styles.skeletonText, { width: 90, height: 16 }]} />
                </View>

                {/* Valor a recaudar */}
                <View style={styles.row}>
                    <View style={[styles.skeletonText, { width: 120, height: 16 }]} />
                    <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
                </View>
            </View>

            {/* Header de órdenes a entregar */}
            <View style={styles.headerContainerTwo}>
                <View style={[styles.skeletonText, { width: 160, height: 22 }]} />
            </View>

            {/* Lista de órdenes simulada */}
            <View style={styles.invoicesContainer}>
                {/* Item de factura 1 */}
                <View style={styles.invoiceItem}>
                    <View style={styles.invoiceHeader}>
                        <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
                        <View style={[styles.skeletonStatus, { width: 70, height: 24 }]} />
                    </View>
                    <View style={[styles.skeletonText, { width: 150, height: 14, marginTop: 4 }]} />
                    <View style={styles.invoiceFooter}>
                        <View style={[styles.skeletonText, { width: 80, height: 14 }]} />
                        <View style={[styles.skeletonText, { width: 100, height: 16 }]} />
                    </View>
                </View>

                {/* Item de factura 2 */}
                <View style={styles.invoiceItem}>
                    <View style={styles.invoiceHeader}>
                        <View style={[styles.skeletonText, { width: 100, height: 18 }]} />
                        <View style={[styles.skeletonStatus, { width: 70, height: 24 }]} />
                    </View>
                    <View style={[styles.skeletonText, { width: 150, height: 14, marginTop: 4 }]} />
                    <View style={styles.invoiceFooter}>
                        <View style={[styles.skeletonText, { width: 80, height: 14 }]} />
                        <View style={[styles.skeletonText, { width: 100, height: 16 }]} />
                    </View>
                </View>

            </View>

            {/* Footer con botón skeleton */}
            <View style={styles.footer}>
                <View style={[styles.skeletonButton, { width: 328, height: 43 }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        alignItems: 'center',
        backgroundColor: '#F9F9FA',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 35,
        paddingBottom: 5,
        backgroundColor: '#F9F9FA',
    },
    headerContainerTwo: {
        width: '100%',
        backgroundColor: '#F9F9FA',
        marginTop: 15,
        paddingLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    card: {
        width: 360,
        minHeight: 240,
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
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 2,
    },
    invoicesContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 8,
        gap: 12,
    },
    invoiceItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0F1F5',
        gap: 8,
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    invoiceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    skeletonIcon: {
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
    skeletonButton: {
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
});