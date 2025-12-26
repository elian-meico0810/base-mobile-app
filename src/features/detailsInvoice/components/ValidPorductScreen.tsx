import { formatNumber, formatStringToNumber } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface Product {
    id: number;
    quantity: string;
    name: string;
    sku: string;
    total: string;
    unit: string;
    imageUrl?: string;
    validated?: boolean;
    validationType?: string;
}

interface ProductItemProps {
    item: Product;
    isLastItem: boolean;
    onValidate: (id: number) => void;
    validationType?: string | null;
}

const { width, height } = Dimensions.get('window');

export const ValidPorductScreen = ({ item, isLastItem, onValidate, validationType }: ProductItemProps) => {
    return (
        <View style={styles.productContainer}>
            <View style={styles.productRow}>
                <View style={styles.imageContainer}>
                    {item.imageUrl ? (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            {validationType === "left" ? (
                                <View style={styles.statusDot}>
                                    <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                </View>
                            ) : validationType === "right" ? (
                                <View style={styles.warningDot}>
                                    <MaterialIcons name="warning" size={9} color="#FFA400" />
                                </View>
                            ) : (
                                <View style={styles.errorDot}>
                                    <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="photo" size={40} color="#D1D3D8" />
                            <Text style={styles.placeholderText}>Sin imagen</Text>
                        </View>
                    )}
                </View>


                <View style={styles.productInfo}>
                    <View style={styles.row}>
                        <View style={styles.leftInfo}>
                            <View style={styles.productHeader}>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                            </View>

                            <Text style={styles.productName} numberOfLines={2}>
                                {item.name}
                            </Text>

                            <Text style={styles.productSku}>
                                {item.sku}
                            </Text>
                        </View>

                        <View style={styles.priceRow}>
                            <Text style={styles.totalPrice}>
                                $ {formatNumber(formatStringToNumber(item.total))}
                            </Text>
                            <Text style={styles.unitPrice}>{item.unit}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Separador con mejor espaciado */}
            <View style={styles.separator} />
        </View>
    );
};

const styles = StyleSheet.create({
    productContainer: {
        backgroundColor: 'transparent', // Fondo verde claro para productos validados
        paddingVertical: 10, // Más padding vertical
        paddingHorizontal: 16,
        marginHorizontal: 8,
        borderColor: '#F9F9FA',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    imageContainer: {
        marginRight: 12, // Más espacio entre imagen y texto
    },
    productImage: {
        width: 85,
        height: 85,
        borderRadius: 6,
        backgroundColor: '#F0F1F5',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: 85,
        height: 85,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    placeholderText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
    productInfo: {
        flex: 1,
        flexDirection: 'column',
        minHeight: 85,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    leftInfo: {
        flex: 1,
        paddingRight: 8,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    quantityText: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 14,
        color: '#141D32',
    },
    productName: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 12,
        color: '#141D32',
        marginBottom: 4,
        maxWidth: 150,
    },
    productSku: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 12,
        color: '#788095',
    },
    priceRow: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: 'auto',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#141D32',
    },
    unitPrice: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#ccccccff',
        marginTop: 15,
        width: width,
        alignSelf: 'center'
    },
    imageWrapper: {
        position: 'relative',
    },
    statusDot: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        borderRadius: 6.5,
        backgroundColor: '#1F9144',
        borderWidth: 2,
        borderColor: '#1F9144',
    },
    errorDot: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        width: 13,
        height: 13,
        borderRadius: 6.5,
        backgroundColor: '#FF3B30',
        borderWidth: 2,
        borderColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningDot: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        width: 13,
        height: 13,
        borderRadius: 6.5,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
});