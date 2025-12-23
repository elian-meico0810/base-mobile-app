import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { formatNumber, formatStringToNumber } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ValidPorductScreen } from './ValidPorductScreen';

const { width, height } = Dimensions.get('window');

// Importar el componente ValidPorductScreen

// Definir tipo para el producto
interface Product {
    id: number;
    quantity: string;
    name: string;
    sku: string;
    total: string;
    unit: string;
    imageUrl?: string;
    validated?: boolean;
    validationType?: 'success' | 'warning';

}

// Datos de ejemplo con URLs de imagen
const initialProductsData: Product[] = [
    {
        id: 1,
        quantity: '20',
        name: 'Jabon desengrasante para vajilla Axion 250 ml',
        sku: '5648982123456',
        total: '$44.000',
        unit: '$2.200 c/u',
        imageUrl: 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
        validated: false
    },
    {
        id: 2,
        quantity: '40',
        name: 'Cerveza Miller Lite Botella 330 ml',
        sku: '5648982123456',
        total: '$100.000',
        unit: '$2.500 c/u',
        imageUrl: 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
        validated: false
    },
    {
        id: 3,
        quantity: '120',
        name: 'Agua Mineral Penafiel 21',
        sku: '5648982123456',
        total: '$126.000',
        unit: '$1.050 c/u',
        imageUrl: 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
        validated: false
    },
    {
        id: 4,
        quantity: '15',
        name: 'Detergente líquido Ariel 500 ml',
        sku: '5648982123457',
        total: '$75.000',
        unit: '$5.000 c/u',
        imageUrl: 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
        validated: false
    },
    {
        id: 5,
        quantity: '30',
        name: 'Galletas Oreo 120g',
        sku: '5648982123458',
        total: '$90.000',
        unit: '$3.000 c/u',
        imageUrl: 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
        validated: false
    },
    {
        id: 6,
        quantity: '25',
        name: 'Leche entera 1L',
        sku: '5648982123459',
        total: '$62.500',
        unit: '$2.500 c/u',
        imageUrl: 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
        validated: false
    },
];

// Props del componente ProductItem
interface ProductItemProps {
    item: Product;
    isLastItem: boolean;
    onValidate: (id: number, direction: 'left' | 'right') => void;
}

const ProductItem = ({ item, isLastItem, onValidate }: ProductItemProps) => {
    const [swipePosition] = useState(new Animated.Value(0));
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [isSwiped, setIsSwiped] = useState(false);
    const swipeThreshold = 50;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Determinar dirección del deslizamiento mientras se mueve
                if (gestureState.dx < -10) {
                    setSwipeDirection('left');
                } else if (gestureState.dx > 10) {
                    setSwipeDirection('right');
                }

                Animated.event([null, { dx: swipePosition }], {
                    useNativeDriver: false
                })(_, gestureState);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > swipeThreshold) {
                    setSwipeDirection('right');
                    setIsSwiped(true);

                    // Swipe derecha = amarillo = WARNING
                    Animated.timing(swipePosition, {
                        toValue: 40,
                        duration: 200,
                        useNativeDriver: false
                    }).start(() => {
                        const timer = setTimeout(() => {
                            Animated.timing(swipePosition, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: false
                            }).start(() => {
                                swipePosition.setValue(0);
                                setIsSwiped(false);
                                setSwipeDirection(null);
                                // Llamar a onValidate DESPUÉS de la animación (3 segundos)
                                onValidate(item.id, 'right');
                            });
                        }, 300);

                        return () => clearTimeout(timer);
                    });

                } else if (gestureState.dx < -swipeThreshold) {
                    setSwipeDirection('left');
                    setIsSwiped(true);

                    Animated.timing(swipePosition, {
                        toValue: -40,
                        duration: 200,
                        useNativeDriver: false
                    }).start(() => {
                        const timer = setTimeout(() => {
                            Animated.timing(swipePosition, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: false
                            }).start(() => {
                                swipePosition.setValue(0);
                                setIsSwiped(false);
                                setSwipeDirection(null);
                                onValidate(item.id, 'left');
                            });
                        }, 300);

                        return () => clearTimeout(timer);
                    });
                } else {
                    // Volver a la posición original
                    Animated.spring(swipePosition, {
                        toValue: 0,
                        useNativeDriver: false
                    }).start();
                }
            }
        })
    ).current;

    // Determinar qué mostrar basado en el estado
    const showSideBar = isSwiped;

    let barColor = '#FFA400';
    let barPosition: 'left' | 'right' = 'left';

    if (isSwiped) {
        if (swipeDirection === 'left') {
            barColor = '#4CAF50';
            barPosition = 'right';
        } else if (swipeDirection === 'right') {
            barColor = '#FFA400';
            barPosition = 'left';
        }
    }

    return (
        <View style={styles.productContainer}>
            {/* Barra lateral de fondo (se muestra detrás del contenido) */}
            {showSideBar && (
                <View style={[
                    barPosition === 'left' ? styles.sideBarLeft : styles.sideBarRight,
                    {
                        backgroundColor: barColor
                    }
                ]}>
                    <View style={styles.iconContainer}>
                        {barPosition === 'left' ? (
                            <Image
                                source={require("@/assets/icons/WarningImage.png")}
                                style={styles.sideIcon}
                                resizeMode="contain"
                            />
                        ) : (
                            <Image
                                source={require("@/assets/icons/SuccessImage.png")}
                                style={styles.sideIcon}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </View>
            )}

            {/* Contenido principal */}
            <Animated.View
                style={[
                    styles.productItem,
                    {
                        transform: [{ translateX: swipePosition }],
                        backgroundColor: item.validated ? '#E8F5E9' : '#F9F9FA'
                    }
                ]}
                {...panResponder.panHandlers}
            >
                <View style={styles.productRow}>
                    <View style={styles.imageContainer}>
                        {item.imageUrl ? (
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialIcons name="photo" size={32} color="#D1D3D8" />
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
            </Animated.View>
            <View style={styles.separator} />
        </View>
    );
};

interface FinalizedData {
    validatedCount: number;
    pendingCount: number;
    totalValue: number;
    totalValueSuccess: number;
    totalValueWarning: number;
    validatedProducts: Product[];
    statistics: {
        successCount: number;
        warningCount: number;
    };
}
interface ProductValidationSectionProps {
    onFinalize?: (data: FinalizedData) => void;
    onErrorAlert?: boolean;
    onSuccessAlet?: boolean;
}


export const ProductValidationSection = ({ onFinalize, onErrorAlert, onSuccessAlet }: ProductValidationSectionProps) => {
    const [allProducts, setAllProducts] = useState<Product[]>(initialProductsData);
    const [validatedProducts, setValidatedProducts] = useState<Product[]>([]);
    const [showValidatedModal, setShowValidatedModal] = useState(false);
    const [currentValidationType, setCurrentValidationType] = useState('null');

    // Luego, en un useEffect o donde necesites:
    useEffect(() => {
        if (onErrorAlert || onSuccessAlet) {
            // Decide qué tipo de validación usar
            const validationType = onErrorAlert ? 'warning' : 'success';
            validateAllProducts(validationType);
            setCurrentValidationType(validationType); // Guarda el tipo en el estado

        }
    }, [onErrorAlert, onSuccessAlet]);

    // Agrega esta función en tu componente
    const validateAllProducts = (validationType: 'success' | 'warning' = 'success') => {
        if (allProducts.length === 0) return;

        // Mover todos los productos a validados
        setValidatedProducts(prev => [
            ...prev,
            ...allProducts.map(product => ({
                ...product,
                validated: true,
                validationType: validationType
            }))
        ]);

        // Vaciar la lista principal
        setAllProducts([]);
    };

    const handleValidate = (id: number, direction: 'left' | 'right') => {
        const productToValidate = allProducts.find(p => p.id === id);
        if (!productToValidate) return;

        // Quitar de la lista principal
        setAllProducts(prev => prev.filter(p => p.id !== id));

        // Agregar a la lista de validados - IMPORTANTE: NO usar el mismo objeto
        setValidatedProducts(prev => [...prev, {
            ...productToValidate,
            validated: true, // Esto solo afecta a los productos en validatedProducts
            validationType: direction === 'left' ? 'success' : 'warning'
        }]);
    };

    // Calcular estadísticas
    const pendingCount = allProducts.length;
    const validatedCount = validatedProducts.length;
    const totalProducts = allProducts.length + validatedProducts.length;
    const progressPercentage = totalProducts > 0 ? (validatedCount / totalProducts) * 100 : 0;

    // Calcular valor total a recaudar (AMBOS tipos)
    const totalValue = validatedProducts.reduce((sum, product) => {
        const numericValue = formatStringToNumber(product.total);
        return sum + numericValue;
    }, 0);

    // Calcular valor por tipo (opcional para mostrar separado)
    const totalValueSuccess = validatedProducts
        .filter(product => product.validationType === 'success')
        .reduce((sum, product) => {
            const numericValue = formatStringToNumber(product.total);
            return sum + numericValue;
        }, 0);

    const totalValueWarning = validatedProducts
        .filter(product => product.validationType === 'warning')
        .reduce((sum, product) => {
            const numericValue = formatStringToNumber(product.total);
            return sum + numericValue;
        }, 0);

    const isValid = validatedCount > 0;

    const handleFinalize = () => {
        const finalData: FinalizedData = {
            validatedCount,
            pendingCount,
            totalValue,
            totalValueSuccess,
            totalValueWarning,
            validatedProducts,
            statistics: {
                successCount: validatedProducts.filter(p => p.validationType === 'success').length,
                warningCount: validatedProducts.filter(p => p.validationType === 'warning').length,
            }
        };
        onFinalize?.(finalData);
        console.log('=== RESUMEN FINAL ===');
        console.log(`Productos procesados: ${validatedCount}`);
        console.log(`  - Success (verde): ${validatedProducts.filter(p => p.validationType === 'success').length}`);
        console.log(`  - Warning (amarillo): ${validatedProducts.filter(p => p.validationType === 'warning').length}`);
        console.log(`Productos pendientes: ${pendingCount}`);
        console.log(`Valor total (ambos): $${totalValue}`);
        console.log(`Valor success: $${totalValueSuccess}`);
        console.log(`Valor warning: $${totalValueWarning}`);

        // Mostrar modal con productos validados
        setShowValidatedModal(true);
    };

    // Separar productos por tipo para mostrar
    const successProducts = validatedProducts.filter(p => p.validationType === 'success');
    const warningProducts = validatedProducts.filter(p => p.validationType === 'warning');

    return (
        <View style={styles.mainContainer}>
            {allProducts.length > 0 && (
                <View style={styles.subtitleContainer}>
                    <Text style={styles.headerTSubitle}>Por validar</Text>
                </View>
            )}

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                    paddingBottom: 160,
                }}            >
                <View style={styles.container}>
                    {/* Mostrar productos en lista principal */}
                    {allProducts.length > 0 && (
                        allProducts.map((item, index) => (
                            <ProductItem
                                key={item.id}
                                item={item}
                                isLastItem={index === allProducts.length - 1}
                                onValidate={handleValidate}
                            />
                        ))
                    )}

                    {/* Mostrar TODOS los productos validados juntos */}
                    {validatedProducts.length > 0 && (
                        <>
                            <View style={styles.subtitleContainer}>
                                <Text style={styles.headerTSubitle}>Validados</Text>
                            </View>
                            {validatedProducts.map((item, index) => (
                                <ValidPorductScreen
                                    key={item.id}
                                    item={item}
                                    isLastItem={index === validatedProducts.length - 1}
                                    onValidate={() => {
                                        // Regresar a la lista principal
                                        setValidatedProducts(prev => prev.filter(p => p.id !== item.id));
                                        setAllProducts(prev => [...prev, {
                                            ...item,
                                            validated: false
                                        }]);
                                    }}
                                    validationType={currentValidationType}
                                />
                            ))}
                        </>
                    )}

                    <View style={styles.bottomSpacing} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={styles.progressRow}>
                    <Text style={styles.pendingText}>
                        Te faltan{' '}
                        <Text style={styles.pendingBold}>{pendingCount} productos</Text>
                        {' '}por validar
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${progressPercentage}%`,
                                        backgroundColor:
                                            progressPercentage === 100 ? '#1F9144' : '#164194',
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Mostrar valor total (AMBOS tipos) */}
                <View style={styles.valueRow}>
                    <Text style={styles.valueLabel}>Valor a recaudar:</Text>
                    <Text style={styles.valueAmount}>$ {formatNumber(totalValue)}</Text>
                </View>

                {/* Mostrar desglose opcional */}
                {/* {validatedCount > 0 && (
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownText}>
                            {successProducts.length} éxito | {warningProducts.length} advertencia
                        </Text>
                    </View>
                )} */}

                <View style={styles.buttonRow}>
                    <PrimaryButton
                        title="Finalizar"
                        onPress={handleFinalize}
                        disabled={!isValid}
                        width={348}
                        height={43}
                    />
                </View>
            </View>
        </View>
    );
};
// Estilos para el ValidPorductScreen


const styles = StyleSheet.create({
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    breakdownText: {
        fontFamily: 'Rubik',
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9F9FA',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#F9F9FA',
    },
    container: {
        minHeight: '100%',
        paddingBottom: 10,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyListText: {
        fontFamily: 'Rubik',
        fontSize: 16,
        color: '#4CAF50',
        marginTop: 16,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontFamily: 'Rubik',
        fontSize: 14,
        color: '#788095',
        marginTop: 2,
    },
    validatedTitle: {
        fontFamily: 'Rubik',
        fontSize: 24,
        fontWeight: '700',
        color: '#1F9144',
    },
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
        position: 'relative',
        zIndex: 2,
    },
    sideBarLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 40,
        height: 117,
        backgroundColor: '#FFA400',
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        opacity: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    sideBarRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 40,
        height: 117,
        backgroundColor: '#1F9144',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        opacity: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sideIcon: {
        width: 24,
        height: 24,
        opacity: 1,
    },
    separator: {
        height: 0.5,
        backgroundColor: '#ccccccff',
        position: 'relative',
        zIndex: 3,
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
    bottomSpacing: {
        height: 20,
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
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 6,
        elevation: 8,
        shadowColor: '#000',
    },
    pendingText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14,
        color: '#141D32',
        marginBottom: 2,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    progressBarBackground: {
        width: 67,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 100,
        overflow: 'hidden',
        marginRight: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 100,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        minWidth: 40,
        textAlign: 'right',
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    valueLabel: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14,
        color: '#141D32',
        marginBottom: 2,
    },
    valueAmount: {
        fontSize: 20,
        fontWeight: '600',
        color: '#141D32',
    },
    buttonRow: {
        alignItems: 'center',
        marginBottom: 45,
    },
    pendingBold: {
        fontFamily: 'Rubik',
        fontWeight: '700',
    },
    // Estilos del modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#F9F9FA',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontFamily: 'Rubik',
        fontSize: 20,
        fontWeight: '700',
        color: '#141D32',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    subtitleContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 10,
        alignItems: 'flex-start',
    },
    headerTSubitle: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 18,
        color: '#000',
        textAlign: 'left',
    },
    modalFooter: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    summaryText: {
        fontFamily: 'Rubik',
        fontSize: 16,
        fontWeight: '600',
        color: '#141D32',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyStateText: {
        fontFamily: 'Rubik',
        fontSize: 16,
        color: '#788095',
        marginTop: 16,
    },
});