import { formatNumber, formatStringToNumber } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
    quantityEntry?: string;
}

interface ProductItemProps {
    item: Product;
    isLastItem: boolean;
    onValidate: (id: number) => void;
    validationType?: string | null;
    idValue?: number | null;
    tatolValue?: number | null;
}
type ValueById = {
    idValue: number;
    tatolValue: number;
};
const { width, height } = Dimensions.get('window');

export const ValidPorductScreen = ({ item, isLastItem, onValidate, validationType, idValue, tatolValue }: ProductItemProps) => {
    const [valuesById, setValuesById] = useState<Record<number, ValueById>>({});

    useEffect(() => {
        if (
            idValue !== null &&
            idValue !== undefined &&
            tatolValue !== null &&
            tatolValue !== undefined
        ) {
            setValuesById(prev => ({
                ...prev,
                [idValue]: {
                    idValue,
                    tatolValue,
                },
            }));
        }
    }, [idValue, tatolValue]);

    const quantityEntry = Number(item?.quantityEntry);
    const quantity = Number(item?.quantity);

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
                            {(validationType === "success" || quantityEntry === quantity) ? (
                                <View style={styles.statusDot}>
                                    <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                </View>
                            ) : (validationType === "error" || quantityEntry === 0) ? (
                                <View style={styles.errorDot}>
                                    <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                </View>
                            ) : (validationType === "warning" || (quantityEntry > 0 && quantityEntry < quantity)) ? (
                                <View style={styles.warningDot}>
                                    <MaterialIcons name="warning" size={9} color="#FFA400" />
                                </View>
                            ) : null}

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
                                {valuesById[item.id] ? (
                                    <Text style={styles.quantityText}>
                                        {valuesById[item.id].tatolValue}
                                    </Text>
                                ) : (
                                    <Text style={styles.quantityText}>{item.quantity}</Text>

                                )}

                                {valuesById[item.id] && (
                                    <Text style={styles.quantityTextValue}>
                                        {item.quantity}
                                    </Text>
                                )}

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
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        borderColor: '#F9F9FA',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    imageContainer: {
        marginRight: 12,
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
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
    quantityTextValue: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 12,
        textDecorationLine: 'line-through',
        color: '#788095',
    },
});