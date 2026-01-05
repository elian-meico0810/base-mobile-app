import { TypeCaculateValueEnum } from '@/src/constants/GuideStates';
import { calculateVlueByPorducts, capitalizeWords, formatNumber } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Detail } from '../../tracking/domain/details/DetailsGuide';

const { width } = Dimensions.get('window');

// Props del componente ProductItem
interface ProductItemProps {
    item: Detail;
    isLastItem: boolean;
    onValidate: (id: number, direction: 'left' | 'right') => void;
    onPresssNovlety?: (direction: 'left' | 'right' | null) => void;
    shouldAutoValidate?: boolean;
    activeSwipeId: string | null;
    setActiveSwipeId: (id: string | null) => void;
    onCloseReport?: (value: boolean) => void;
    id?: number;
    testToken?: string;
    testUrl?: string;
}

export const ProductItem = ({
    item,
    onValidate,
    onPresssNovlety,
    shouldAutoValidate = false,
    activeSwipeId,
    setActiveSwipeId,
    onCloseReport,
    testToken,
    testUrl
}: ProductItemProps) => {
    const swipePosition = useRef(new Animated.Value(0)).current;
    const swipeDirection = useRef<'left' | 'right' | null>(null);
    const isSwiped = useRef(false);
    const isClosing = useRef(false);
    const hasAutoValidated = useRef(false);
    const panResponder = useRef<ReturnType<typeof PanResponder.create> | null>(null);
    const swipeThreshold = 50;
    const itemIdString = item.id.toString();

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

    // Efecto para cerrar este elemento si otro se activa
    useEffect(() => {
        if (activeSwipeId !== null &&
            activeSwipeId !== itemIdString &&
            swipeDirection.current === 'right' &&
            !isClosing.current) {
            handleCloseSwipe();
            isClosing.current = true;
        }
    }, [activeSwipeId, itemIdString]);

    useEffect(() => {
        if (shouldAutoValidate &&
            activeSwipeId === itemIdString &&
            swipeDirection.current === 'right' &&
            !hasAutoValidated.current) {

            hasAutoValidated.current = true;

            setTimeout(() => {
                handleRightSwipeValidation();
            }, 300);
        }
    }, [shouldAutoValidate, activeSwipeId, itemIdString]);

    useEffect(() => {
        // Resetear hasAutoValidated cuando el elemento deja de ser el activo
        if (activeSwipeId !== itemIdString) {
            hasAutoValidated.current = false;
        }
    }, [activeSwipeId, itemIdString]);

    useEffect(() => {
        onPresssNovlety?.(swipeDirection.current);
    }, [swipeDirection.current, onPresssNovlety]);

    const handleCloseSwipe = useCallback(() => {
        hasAutoValidated.current = false;
        Animated.timing(swipePosition, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            swipePosition.setValue(0);
            isSwiped.current = false;
            swipeDirection.current = null;
            isClosing.current = false;

            if (activeSwipeId === itemIdString) {
                setActiveSwipeId(null);
            }
        });
    }, [activeSwipeId, itemIdString, setActiveSwipeId, swipePosition]);

    const handleRightSwipeValidation = useCallback(() => {
        Animated.timing(swipePosition, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            swipePosition.setValue(0);
            isSwiped.current = false;
            swipeDirection.current = null;
            isClosing.current = false;
            setActiveSwipeId(null);
            onValidate(item.id, 'right');
            if (shouldAutoValidate) {
                onCloseReport?.(true);
            }
        });
    }, [item.id, onCloseReport, onValidate, setActiveSwipeId, shouldAutoValidate, swipePosition]);

    // Crear PanResponder una sola vez
    if (!panResponder.current) {
        panResponder.current = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Determinar dirección del deslizamiento mientras se mueve
                if (gestureState.dx < -10) {
                    swipeDirection.current = 'left';
                } else if (gestureState.dx > 10) {
                    swipeDirection.current = 'right';
                }

                // Usar setValue en lugar de Animated.event para mejor rendimiento
                swipePosition.setValue(gestureState.dx);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > swipeThreshold) {
                    // Establecer este como el elemento activo inmediatamente
                    setActiveSwipeId(itemIdString);

                    swipeDirection.current = 'right';
                    isSwiped.current = true;
                    isClosing.current = false;

                    // Swipe derecha = amarillo = WARNING
                    Animated.timing(swipePosition, {
                        toValue: 40,
                        duration: 200,
                        useNativeDriver: true
                    }).start(() => {
                        if (shouldAutoValidate) {
                            handleRightSwipeValidation();
                        }
                    });

                } else if (gestureState.dx < -swipeThreshold) {
                    swipeDirection.current = 'left';
                    isSwiped.current = true;

                    Animated.timing(swipePosition, {
                        toValue: -40,
                        duration: 200,
                        useNativeDriver: true
                    }).start(() => {
                        const timer = setTimeout(() => {
                            Animated.timing(swipePosition, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: true
                            }).start(() => {
                                swipePosition.setValue(0);
                                isSwiped.current = false;
                                swipeDirection.current = null;
                                onValidate(item.id, 'left');
                            });
                        }, 300);

                        return () => clearTimeout(timer);
                    });
                } else {
                    // Volver a la posición original si no superó el threshold
                    Animated.spring(swipePosition, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();

                    // Si este elemento estaba activo y el usuario cancela el swipe
                    if (activeSwipeId === itemIdString) {
                        setActiveSwipeId(null);
                    }
                }
            }
        });
    }

    // Determinar qué mostrar basado en el estado
    const showSideBar = isSwiped.current;

    let barColor = '#FFA400';
    let barPosition: 'left' | 'right' = 'left';

    if (isSwiped.current) {
        if (swipeDirection.current === 'left') {
            barColor = '#4CAF50';
            barPosition = 'right';
        } else if (swipeDirection.current === 'right') {
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
                    { backgroundColor: barColor }
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
                        backgroundColor: '#F9F9FA'
                    }
                ]}
                {...panResponder.current.panHandlers}
            >
                <View style={styles.productRow}>
                    <View style={styles.imageContainer}>
                        {imagUrl ? (
                            <Image
                                source={{ uri: imagUrl }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialIcons name="photo" size={32} color="#D1D3D8" />
                            </View>
                        )}
                    </View>

                    <View style={styles.productInfo}>
                        <View style={styles.row}>
                            <View style={styles.leftInfo}>
                                <View style={styles.productHeader}>
                                    <Text style={styles.quantityText}>{item.unidadesSolicitadas}</Text>
                                </View>

                                <Text style={styles.productName} numberOfLines={2}>
                                    {capitalizeWords(item.producto.nombre)}
                                </Text>

                                <Text style={styles.productSku}>
                                    {item.producto.codigo.trim()}
                                </Text>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={styles.totalPrice}>
                                    ${formatNumber(calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_1) ?? 0)}
                                </Text>
                                <Text style={styles.unitPrice}>$ {formatNumber(calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_2) ?? 0)} c/u</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>
            <View style={styles.separator} />
        </View>
    );
};

// Mantén los mismos estilos...
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