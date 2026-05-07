import { TypeStatusEnum } from '@/src/constants/GuideStates';
import { capitalizeWords } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { AceptationOrderDetails } from '../../tracking/domain/details/DetailsGuide';

const { width } = Dimensions.get('window');

interface ProductItemOrderProps {
    item: AceptationOrderDetails;
    testToken?: string;
    testUrl?: string;
    isRejected?: boolean;

}

export const ProductItemOrder = ({
    item,
    testToken,
    testUrl,
    isRejected
}: ProductItemOrderProps) => {
    const isOrderRejected = item?.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDI_RECH;

    const requestedUnits = isOrderRejected
        ? Number(item.unidades_rechazadas ?? 0)
        : Number(item.unidades_solicitadas ?? 0);

    const originalUnits = Number(item.unidades_solicitadas ?? 0);

    const [quantity, setQuantity] = useState(requestedUnits);

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 0) {
            setQuantity(prev => prev - 1);
        }
    };

    const buildImageUrl = (
        baseUrl?: string | null,
        token?: string | null,
        code?: string
    ): string | null => {
        if (!baseUrl || !token || !code) return null;
        return `${baseUrl}/${code}.webp${token}`;
    };

    const imageUrl = buildImageUrl(testUrl, testToken, item.producto?.codigo);
    const formattedImageUrl = imageUrl ? imageUrl.replace(/\s+/g, '') : null;


    useEffect(() => {
        if (isRejected && !isOrderRejected) {
            setQuantity(originalUnits);
        }
    }, [isRejected]);

    return (    
        <View style={styles.productContainer}>
            <Animated.View style={styles.productItem}>
                <View style={styles.productRow}>

                    <View style={styles.imageContainer}>
                        {formattedImageUrl ? (
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: formattedImageUrl }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />

                                {(isRejected || item.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDI_RECH) ? (
                                    <View style={styles.errorDot}>
                                        <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                    </View>

                                ) : (item.unidades_rechazadas == 0|| item.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDIDO_ACEPT) ? (

                                    <View style={styles.statusDot}>
                                        <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                    </View>

                                ) : (item.unidades_rechazadas > 0 || item.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDI_ENT_PARC) ? (

                                    <View style={styles.warningDot}>
                                        <MaterialIcons name="warning" size={12} color="#FFA400" />
                                    </View>

                                ) : null}
                            </View>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialIcons name="photo" size={32} color="#D1D3D8" />
                                {(item.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDIDO_ACEPT) ? (
                                    <View style={styles.statusDot}>
                                        <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                    </View>
                                ) : (isRejected || item.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDI_RECH) ? (
                                    <View style={styles.errorDot}>
                                        <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                    </View>
                                ) : (item.aceptacion_pedido?.estado_pedido?.codigo === TypeStatusEnum.EST_PEDI_ENT_PARC) ? (
                                    <View style={styles.warningDot}>
                                        <MaterialIcons name="warning" size={12} color="#FFA400" />
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </View>

                    <View style={styles.productInfo}>

                        <View style={styles.leftContent}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {capitalizeWords(item.producto.nombre)}
                            </Text>

                            <Text style={styles.productSku}>
                                {item.producto.codigo.trim()}
                            </Text>
                        </View>

                        <View style={styles.counterContainer}>

                            <Pressable
                                style={[
                                    styles.button,
                                    (isRejected || isOrderRejected) && styles.buttonDisabled
                                ]}
                                onPress={decreaseQuantity}
                                disabled={(isRejected || isOrderRejected)}
                            >
                                <Text style={styles.buttonText}>-</Text>
                            </Pressable>

                            <Text style={styles.quantity}>
                                {isRejected ?  originalUnits : quantity}
                            </Text>

                            <Pressable
                                style={[
                                    styles.button,
                                    (isRejected || isOrderRejected) && styles.buttonDisabled
                                ]}
                                onPress={increaseQuantity}
                                disabled={(isRejected || isOrderRejected)}
                            >
                                <Text style={styles.buttonText}>+</Text>
                            </Pressable>

                        </View>

                    </View>
                </View>
            </Animated.View>

            <View style={styles.separator} />
        </View>
    );
};

const styles = StyleSheet.create({
    productContainer: {
        position: 'relative',
        width: width,
    },
    productItem: {
        width: width,
        padding: 16,
        marginHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#F9F9FA',
    },
    separator: {
        height: 0.5,
        backgroundColor: '#ccccccff',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        marginRight: 12,
    },
    imageWrapper: {
        position: 'relative',
    },
    productImage: {
        width: 85,
        height: 85,
        borderRadius: 6,
        backgroundColor: '#F0F1F5',
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
    productInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 85,
    },
    productName: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        color: '#141D32',
        marginBottom: 4,
        maxWidth: 140,
    },
    productSku: {
        fontFamily: 'Rubik',
        fontWeight: '400',
        fontSize: 12,
        color: '#788095',
        marginBottom: 12,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 10,
    },
    button: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#164194',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 18,
    },
    quantity: {
        fontSize: 14,
        fontWeight: '600',
        color: '#141D32',
        minWidth: 24,
        textAlign: 'center',
    },
    leftContent: {
        flex: 1,
        paddingRight: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A0A0A0',
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
});