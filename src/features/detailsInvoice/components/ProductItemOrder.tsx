import { capitalizeWords } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
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
}

export const ProductItemOrder = ({
    item,
    testToken,
    testUrl,
}: ProductItemOrderProps) => {

    const requestedUnits = Number(item.unidades_solicitadas ?? 0);

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
                            </View>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialIcons name="photo" size={32} color="#D1D3D8" />
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
                                style={styles.button}
                                onPress={decreaseQuantity}
                            >
                                <Text style={styles.buttonText}>-</Text>
                            </Pressable>

                            <Text style={styles.quantity}>
                                {quantity}
                            </Text>

                            <Pressable
                                style={styles.button}
                                onPress={increaseQuantity}
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
});