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
import { ProductoPedido } from '../../tracking/domain/details/DetailsGuide';

const { width } = Dimensions.get('window');

interface ProductItemAceptationProps {
    item: ProductoPedido;
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
    onItemData?: (data: any | null) => void;
    refreshing?: boolean;
    onRefreshing?: () => void;
    onDataProduct?: (id: number, total: number, unidadesEntregadas?: number | null) => void;
    porcentajeDFR?: number;
    notDetails?: string;
}

export const ProductItemAceptation = ({
    item,
    onValidate,
    onPresssNovlety,
    shouldAutoValidate = false,
    activeSwipeId,
    setActiveSwipeId,
    onCloseReport,
    testToken,
    testUrl,
    onItemData,
    refreshing,
    onRefreshing,
    onDataProduct,
    porcentajeDFR,
    notDetails
}: ProductItemAceptationProps) => {
    const isValidated = Number(item?.unidades_rechazadas) > 0;
    const deliveredUnits = Number(item?.unidades_entregadas ?? 0);
    const rejectedUnits = Number(item?.unidades_rechazadas ?? 0);
    const requestedUnits = Number(item?.unidades_solicitadas ?? 0);
    const [hasNotified, setHasNotified] = useState(false);

    let statusIcon: 'success' | 'error' | 'warning' | null = null;
    if (requestedUnits === deliveredUnits && requestedUnits > 0) {
        statusIcon = 'success';
    } else if (deliveredUnits === 0 && item?.unidades_rechazadas > 0) {
        statusIcon = 'error';
    } else if (requestedUnits > 0 && deliveredUnits > 0 && deliveredUnits !== requestedUnits) {
        statusIcon = 'warning';
    }

    // Función auxiliar para calcular valor del producto
    const calculateProductValue = (units: number): number => {
        const baseValue = Number(item?.valor_base_producto ?? 0);
        const taxes = Number(item?.total_impuestos ?? 0);
        return (baseValue + taxes) * units;
    };

    let totalValueDisplay = 0
    totalValueDisplay = (deliveredUnits > 0 ? calculateProductValue(deliveredUnits) : 0)

    if (deliveredUnits === 0  && !rejectedUnits || rejectedUnits == 0) {
        totalValueDisplay = (Number(item?.unidades_solicitadas ?? 0) > 0 ? calculateProductValue(Number(item?.unidades_solicitadas ?? 0)) : 0)
    }

    const swipePosition = useRef(new Animated.Value(0)).current;
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [isSwiped, setIsSwiped] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false);
    const [showRefreshing, setRefreshing] = useState(refreshing ? true : false);
    const [isRefreshing, setIsRefreshing] = useState(false);
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
    const formattedImagUrl = imagUrl ? imagUrl.replace(/\s+/g, '') : null;

    useEffect(() => {
        if (onDataProduct) {
            const deliveredEstimate = Math.max(Number(item.unidades_solicitadas) - Number(item.unidades_solicitadas), 0);
            const totalValue = isValidated
                ? (deliveredUnits > 0 ? calculateProductValue(deliveredUnits) : 0)
                : (deliveredEstimate > 0 ? calculateProductValue(deliveredEstimate) : 0);
            onDataProduct(item.id, totalValue, item?.unidades_entregadas);
        }
    }, [
        item.id,
        item.unidades_entregadas,
        item.unidades_rechazadas,
        item.unidades_solicitadas,
        item.total_impuestos,
        item.valor_base_producto,
    ]);

    // Efecto para manejar refreshing externo
    useEffect(() => {
        if (refreshing && !isRefreshing) {
            setIsRefreshing(true);

            if (isSwiped || swipeDirection) {
                if (isAnimating.current) {
                    isAnimating.current = false;
                }
                Animated.timing(swipePosition, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true
                }).start();

                handleCloseSwipe();
                onRefreshing?.();
                onItemData?.(null);

                setSwipeDirection(null);
                setIsSwiped(false);
                setShowSideBar(false);
                onCloseReport?.(false);
                setIsRefreshing(false);
                setHasNotified(false); // ← RESET al hacer refresh
            } else {
                setIsRefreshing(false);
            }
        }
    }, [refreshing, isSwiped, swipeDirection]);

    // Actualizar barra de colores - SOLO para swipe derecho
    useEffect(() => {
        if (isSwiped && swipeDirection === 'right') {
            setBarConfig({
                color: '#FFA400',
                position: 'left',
                icon: 'warning'
            });
            setShowSideBar(true);
        } else {
            setShowSideBar(false);
        }
    }, [isSwiped, swipeDirection]);

    // Efecto para cerrar este elemento si otro se activa
    useEffect(() => {
        if (activeSwipeId !== null &&
            activeSwipeId !== itemIdString &&
            isSwiped &&
            swipeDirection === 'right' &&
            !isAnimating.current || showRefreshing) {
            hasAutoValidated.current = true;
            handleCloseSwipe();
            setRefreshing(false);
            setHasNotified(false); // ← RESET
        }
    }, [activeSwipeId, itemIdString, isSwiped, swipeDirection, showRefreshing]);

    useEffect(() => {
        if (shouldAutoValidate &&
            activeSwipeId === itemIdString &&
            swipeDirection === 'right' &&
            !hasAutoValidated.current) {
            hasAutoValidated.current = true;
            handleRightSwipeValidation();
        }
    }, [shouldAutoValidate, activeSwipeId, itemIdString, swipeDirection]);

    useEffect(() => {
        if (activeSwipeId !== itemIdString) {
            hasAutoValidated.current = false;
            setHasNotified(false); // ← RESET al cambiar de producto activo
        }
    }, [activeSwipeId, itemIdString]);

    // Notificar SOLO para swipe derecho - UNA SOLA VEZ por swipe
    useEffect(() => {
        if (swipeDirection === 'right' && !hasNotified) {
            setHasNotified(true);
            onPresssNovlety?.(swipeDirection);
        }
    }, [swipeDirection, onPresssNovlety, hasNotified]);

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

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return !isAnimating.current;
            },
            onMoveShouldSetPanResponder: (_, gestureState) => {
                if (isAnimating.current) return false;
                // SOLO permitir movimiento hacia la DERECHA (dx > 0)
                if (gestureState.dx < 0) return false;
                return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
            },
            onPanResponderMove: (_, gestureState) => {
                if (isAnimating.current) return;

                // SOLO valores positivos (hacia derecha)
                if (gestureState.dx < 0) return;

                const limitedDx = Math.max(Math.min(gestureState.dx, 100), 0);

                if (Math.abs(gestureState.dx) > minSwipeDistance) {
                    if (gestureState.dx > 0) {
                        setSwipeDirection('right');
                    }
                }

                swipePosition.setValue(limitedDx);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (isAnimating.current) return;

                const isRightSwipe = gestureState.dx > swipeThreshold;

                if (isRightSwipe) {
                    onItemData?.(item);

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

                        if (activeSwipeId === itemIdString) {
                            setActiveSwipeId(null);
                        }
                        setHasNotified(false); // ← RESET al cancelar swipe
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
                    setHasNotified(false); // ← RESET
                });
            }
        })
    ).current;

    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('es-CO').format(value);
    };

    const capitalizeWords = (text: string): string => {
        if (!text) return '';
        return text.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <View style={styles.productContainer}>
            {/* Barra lateral de fondo - SOLO para swipe derecho */}
            {showSideBar && swipeDirection === 'right' && (
                <View style={styles.sideBarLeft}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require("@/assets/icons/WarningImage.png")}
                            style={styles.sideIcon}
                            resizeMode="contain"
                        />
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
                        {formattedImagUrl ? (
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: formattedImagUrl }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                                {(statusIcon === 'success') ? (
                                    <View style={styles.statusDot}>
                                        <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                    </View>
                                ) : (statusIcon === 'error') ? (
                                    <View style={styles.errorDot}>
                                        <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                    </View>
                                ) : (statusIcon === 'warning') ? (
                                    <View style={styles.warningDot}>
                                        <MaterialIcons name="warning" size={12} color="#FFA400" />
                                    </View>
                                ) : null}
                            </View>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                {(statusIcon === 'success') ? (
                                    <View style={styles.statusDot}>
                                        <MaterialIcons name="check" size={9} color="#FFFFFF" />
                                    </View>
                                ) : (statusIcon === 'error') ? (
                                    <View style={styles.errorDot}>
                                        <MaterialIcons name="close" size={9} color="#FFFFFF" />
                                    </View>
                                ) : (statusIcon === 'warning') ? (
                                    <View style={styles.warningDot}>
                                        <MaterialIcons name="warning" size={12} color="#FFA400" />
                                    </View>
                                ) : null}
                                <MaterialIcons name="photo" size={32} color="#D1D3D8" />
                            </View>
                        )}
                    </View>

                    <View style={styles.productInfo}>
                        <View style={styles.row}>
                            <View style={styles.leftInfo}>
                                <View style={styles.productHeader}>
                                    <Text style={styles.quantityText}>
                                        {isValidated ? deliveredUnits : requestedUnits}
                                    </Text>
                                    {isValidated && requestedUnits !== deliveredUnits && (
                                        <Text style={styles.quantityTextValue}>
                                            {requestedUnits}
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
                                <Text style={styles.totalPrice}>
                                    ${formatNumber(totalValueDisplay ?? 0)}
                                </Text>
                                <Text style={styles.unitPrice}>
                                    $ {formatNumber(calculateProductValue(1) ?? 0)} c/u
                                </Text>
                            </View>
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
    imageWrapper: {
        position: 'relative',
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
        flexDirection: 'column',
        minHeight: 85,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    quantityText: {
        fontFamily: 'Rubik',
        fontWeight: '800',
        fontSize: 14,
        color: '#141D32',
    },
    quantityTextValue: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 12,
        textDecorationLine: 'line-through',
        color: '#788095',
        marginLeft: 6,
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
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    leftInfo: {
        flex: 1,
        paddingRight: 8,
    },
});