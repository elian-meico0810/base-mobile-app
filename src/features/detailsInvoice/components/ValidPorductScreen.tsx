import { TypeCaculateValueEnum } from '@/src/constants/GuideStates';
import { calculateVlueByPorducts, capitalizeWords, formatNumber } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Detail } from '../../tracking/domain/details/DetailsGuide';


interface ProductItemProps {
    item: Detail;
    isLastItem: boolean;
    onValidate: (id: number) => void;
    validationType?: string | null;
    idValue?: number | null;
    tatolValue?: number | null;
    testToken?: string;
    testUrl?: string;
    onDataProduct?: (id: number, total: number, unidadesEntregadas?:number | null) => void; 

}
type ValueById = {
    idValue: number;
    tatolValue: number;
};
const { width, height } = Dimensions.get('window');

export const ValidPorductScreen = ({ item, isLastItem, onValidate, validationType, idValue, tatolValue, testToken, testUrl, onDataProduct }: ProductItemProps) => {
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

    let sumTotal = 0;
    if (item?.novedades) {
        for (const novedad of item.novedades) {
            const valor = parseFloat(novedad.valor);
            if (!isNaN(valor)) {
                sumTotal += valor;
            }

        }
    }

    const quantityEntry = Number(item?.unidadesSolicitadas);
    const quantity = Number(item?.unidadesEntregadas);

    const buildImageUrl = (
        baseUrl?: string | null,
        token?: string | null,
        code?: string
    ): string | null => {
        if (!baseUrl || !token || !code) return null;
        return `${baseUrl}/${code}.webp${token}`;
    };

    const imagUrl = buildImageUrl(
        testUrl,
        testToken,
        item?.producto?.codigo
    );

    
    useEffect(() => {
        if (onDataProduct) {
            onDataProduct(item.id, calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_5, Number(item.unidadesSolicitadas) - Number(sumTotal)), item?.unidadesEntregadas);
        }
    }, [item.id]);

    return (
        <View style={styles.productContainer}>
            <View style={styles.productRow}>
                <View style={styles.imageContainer}>
                    {imagUrl ? (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: imagUrl }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            {(validationType === "success" || quantityEntry === quantity) ? (
                                <View style={styles.statusDot}>
                                    <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                </View>
                            ) : (validationType === "error" || quantity === 0) ? (
                                <View style={styles.errorDot}>
                                    <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                </View>
                            ) : (validationType === "warning" || (quantityEntry > 0 && Number(sumTotal) != Number(quantityEntry))) ? (
                                <View style={styles.warningDot}>
                                    <MaterialIcons name="warning" size={12} color="#FFA400" />
                                </View>
                            ) : null}

                        </View>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            {(validationType === "success" || quantityEntry === quantity) ? (
                                <View style={styles.statusDot}>
                                    <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                </View>
                            ) : (validationType === "error" || quantity === 0) ? (
                                <View style={styles.errorDot}>
                                    <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                </View>
                            ) : (validationType === "warning" || (quantityEntry > 0 && Number(sumTotal) != Number(quantityEntry))) ? (
                                <View style={styles.warningDot}>
                                    <MaterialIcons name="warning" size={12} color="#FFA400" />
                                </View>
                            ) : null}
                            <MaterialIcons name="photo" size={30} color="#D1D3D8" />
                            <Text style={styles.placeholderText}>Sin imagen</Text>
                        </View>
                    )}
                </View>


                <View style={styles.productInfo}>
                    <View style={styles.row}>
                        <View style={styles.leftInfo}>
                            <View style={styles.productHeader}>
                                {Number(sumTotal) > 0 ? (
                                    <Text style={styles.quantityText}>
                                        {Number(item.unidadesSolicitadas) - Number(sumTotal)}
                                    </Text>
                                ) : (Number(sumTotal) == 0 && quantityEntry != quantity && quantity!= 0) ? (
                                    <Text style={styles.quantityText}>
                                        {Number(sumTotal)}
                                    </Text>
                                ) : (quantity == 0) ? (
                                    <Text style={styles.quantityText}>
                                        {item.unidadesEntregadas}
                                    </Text>
                                ) : (
                                    <Text style={styles.quantityText}>
                                        {item.unidadesSolicitadas}
                                    </Text>
                                )}

                                {(quantityEntry != quantity   &&(Number(sumTotal) > 0 || Number(sumTotal) == 0)) && (
                                    <Text style={styles.quantityTextValue}>
                                        {item.unidadesSolicitadas}
                                    </Text>
                                )}

                            </View>

                            <Text style={styles.productName} numberOfLines={2}>
                                {capitalizeWords(item.producto.nombre)}
                            </Text>

                            <Text style={styles.productSku}>
                                {item.producto.codigo.trim()}
                            </Text>
                        </View>

                        <View style={styles.priceRow}>
                            {(Number(sumTotal) > 0 && quantity != 0 || quantityEntry === quantity && quantity != 0) ? (
                                <Text style={styles.totalPrice}>
                                    ${formatNumber(calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_5, Number(item.unidadesSolicitadas) - Number(sumTotal)) ?? 0)}
                                </Text>
                            ) : <Text style={styles.totalPrice}>
                                ${0}
                            </Text>
                            }
                            <Text style={styles.unitPrice}>$ {formatNumber(calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_2) ?? 0)} c/u</Text>
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
        marginTop: 2,
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
        width: 20,
        height: 20,
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