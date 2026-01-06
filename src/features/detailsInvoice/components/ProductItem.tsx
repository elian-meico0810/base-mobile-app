import { TypeCaculateValueEnum } from '@/src/constants/GuideStates';
import { calculateVlueByPorducts, capitalizeWords, formatNumber } from '@/src/utils/uitls';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    onItemData?: (data: Detail) => void; // <-- Cambia a función
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
    testUrl,
    onItemData
}: ProductItemProps) => {
    const swipePosition = useRef(new Animated.Value(0)).current;
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [isSwiped, setIsSwiped] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false);
    const [barConfig, setBarConfig] = useState({
        color: '#FFA400',
        position: 'left' as 'left' | 'right',
        icon: 'warning' as 'warning' | 'success'
    });
    const hasAutoValidated = useRef(false);
    const isAnimating = useRef(false);
    const swipeThreshold = width * 0.15;
    const minSwipeDistance = 20;
    const itemIdString = item.id.toString();

    const buildImageUrl = (
        baseUrl?: string | null,
        token?: string | null,
        code?: string
    ): string | null => {
        if (!baseUrl || !token || !code) return null;
        return `${baseUrl}/${code}.webp${token}`;
    };

    const imagUrl = buildImageUrl(testUrl, testToken, item?.producto?.codigo);

    // Actualizar barra de colores cuando cambia el estado
    useEffect(() => {
        if (isSwiped && swipeDirection) {
            if (swipeDirection === 'left') {
                setBarConfig({
                    color: '#4CAF50',
                    position: 'right',
                    icon: 'success'
                });
            } else if (swipeDirection === 'right') {
                setBarConfig({
                    color: '#FFA400',
                    position: 'left',
                    icon: 'warning'
                });
            }
            setShowSideBar(true);
        } else {
            setShowSideBar(false);
        }
    }, [isSwiped, swipeDirection]);

    // Efecto para cerrar este elemento si otro se activa (SOLO para swipe derecho)
    useEffect(() => {
        if (activeSwipeId !== null &&
            activeSwipeId !== itemIdString &&
            isSwiped &&
            !isAnimating.current) {
            // Cerrar TODOS los swipes, no solo los derechos
            handleCloseSwipe();
        }
    }, [activeSwipeId, itemIdString, isSwiped, swipeDirection]);

    useEffect(() => {
        if (shouldAutoValidate &&
            activeSwipeId === itemIdString &&
            swipeDirection === 'right' &&
            !hasAutoValidated.current) {

            hasAutoValidated.current = true;
            setTimeout(() => {
                handleRightSwipeValidation();
            }, 500);
        }
    }, [shouldAutoValidate, activeSwipeId, itemIdString, swipeDirection]);

    useEffect(() => {
        if (activeSwipeId !== itemIdString) {
            hasAutoValidated.current = false;
        }
    }, [activeSwipeId, itemIdString]);

    useEffect(() => {
        onPresssNovlety?.(swipeDirection);
    }, [swipeDirection, onPresssNovlety]);

    const handleCloseSwipe = useCallback(() => {
        if (isAnimating.current) return;

        isAnimating.current = true;
        hasAutoValidated.current = false;

        Animated.spring(swipePosition, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true
        }).start(() => {
            swipePosition.setValue(0);
            setIsSwiped(false);
            setSwipeDirection(null);
            setShowSideBar(false);
            isAnimating.current = false;

            if (activeSwipeId === itemIdString) {
                setActiveSwipeId(null);
            }
        });
    }, [activeSwipeId, itemIdString, setActiveSwipeId, swipePosition]);

    const handleRightSwipeValidation = useCallback(() => {
        if (isAnimating.current) return;

        isAnimating.current = true;

        Animated.spring(swipePosition, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true
        }).start(() => {
            swipePosition.setValue(0);
            setIsSwiped(false);
            setSwipeDirection(null);
            setShowSideBar(false);
            setActiveSwipeId(null);
            isAnimating.current = false;

            onValidate(item.id, 'right');
            if (shouldAutoValidate) {
                onCloseReport?.(true);
            }
        });
    }, [item.id, onCloseReport, onValidate, setActiveSwipeId, shouldAutoValidate, swipePosition]);

    const handleLeftSwipeValidation = useCallback(() => {
        if (isAnimating.current) return;

        isAnimating.current = true;

        Animated.spring(swipePosition, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true
        }).start(() => {
            swipePosition.setValue(0);
            setIsSwiped(false);
            setSwipeDirection(null);
            setShowSideBar(false);
            isAnimating.current = false;

            onValidate(item.id, 'left');
        });
    }, [item.id, onValidate, swipePosition]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                // No permitir gestos si ya hay una animación en curso
                return !isAnimating.current;
            },
            onMoveShouldSetPanResponder: (_, gestureState) => {
                if (isAnimating.current) return false;
                return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
            },
            onPanResponderMove: (_, gestureState) => {
                if (isAnimating.current) return;

                const limitedDx = Math.max(Math.min(gestureState.dx, 100), -100);

                if (Math.abs(gestureState.dx) > minSwipeDistance) {
                    if (gestureState.dx < 0) {
                        setSwipeDirection('left');
                    } else if (gestureState.dx > 0) {
                        setSwipeDirection('right');
                    }
                }

                swipePosition.setValue(limitedDx);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (isAnimating.current) return;

                const isRightSwipe = gestureState.dx > swipeThreshold;
                const isLeftSwipe = gestureState.dx < -swipeThreshold;

                if (isRightSwipe) {
                    // console.log("👉 SWIPE DERECHA - ID:", item.id, "Producto:", item);
                    onItemData?.(item);
                    // Para swipe derecho: establecer como activo y cerrar otros
                    setActiveSwipeId(itemIdString);
                    setSwipeDirection('right');
                    setIsSwiped(true);
                    isAnimating.current = true;

                    Animated.spring(swipePosition, {
                        toValue: 60,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true
                    }).start(() => {
                        isAnimating.current = false;
                        if (shouldAutoValidate) {
                            handleRightSwipeValidation();
                        }
                    });

                } else if (isLeftSwipe) {
                    // console.log("👈 SWIPE IZQUIERDA - ID:", item.id, "Producto:", item);
                    onItemData?.(item);

                    // Para swipe izquierdo: no afecta a otros elementos
                    setSwipeDirection('left');
                    setIsSwiped(true);
                    isAnimating.current = true;

                    Animated.spring(swipePosition, {
                        toValue: -60,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true
                    }).start(() => {
                        isAnimating.current = false;
                        setTimeout(() => {
                            handleLeftSwipeValidation();
                        }, 800);
                    });

                } else {
                    // Cancelar swipe
                    isAnimating.current = true;

                    Animated.spring(swipePosition, {
                        toValue: 0,
                        tension: 50,
                        friction: 7,
                        useNativeDriver: true
                    }).start(() => {
                        setIsSwiped(false);
                        setSwipeDirection(null);
                        setShowSideBar(false);
                        isAnimating.current = false;

                        // Si este era el activo y se cancela, limpiar
                        if (activeSwipeId === itemIdString) {
                            setActiveSwipeId(null);
                        }
                    });
                }
            },
            onPanResponderTerminate: () => {
                if (isAnimating.current) return;

                isAnimating.current = true;

                Animated.spring(swipePosition, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true
                }).start(() => {
                    setIsSwiped(false);
                    setSwipeDirection(null);
                    setShowSideBar(false);
                    isAnimating.current = false;

                    if (activeSwipeId === itemIdString) {
                        setActiveSwipeId(null);
                    }
                });
            }
        })
    ).current;

    return (
        <View style={styles.productContainer}>
            {/* Barra lateral de fondo */}
            {showSideBar && (
                <View style={[
                    barConfig.position === 'left' ? styles.sideBarLeft : styles.sideBarRight,
                    { backgroundColor: barConfig.color }
                ]}>
                    <View style={styles.iconContainer}>
                        {barConfig.icon === 'warning' ? (
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
                {...panResponder.panHandlers}
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