import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ProductItemSkeleton } from '@/components/skeleton/ProductItemSkeleton';
import { TypeCaculateValueEnum } from '@/src/constants/GuideStates';
import { calculateVlueByPorducts } from '@/src/utils/uitls';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { OrderGroup, ProductoPedido } from '../../tracking/domain/details/DetailsGuide';
import { ProductItemAceptation } from './ProductItemAceptation';
const { width, height } = Dimensions.get('window');


interface ReasonData {
    type: string;
    units: number;
    description?: string;
}


interface ProductValidationOrderRefusedProps {
    onFinalize?: () => void;
    onErrorAlert?: boolean;
    onSuccessAlet?: boolean;
    onStatusNovelty?: (direction: 'left' | 'right' | null) => void;
    shouldAutoValidate?: boolean;
    modalStatusNovelty?: string | null;
    onCloseReportPorduct?: (value: boolean) => void;
    data?: ReasonData[];
    messages?: (messages: string) => void;
    dataPorduct?: OrderGroup[];
    token?: string;
    onItemData?: (data: OrderGroup) => void;
    refreshing?: boolean;
    onRefreshing?: () => void;
    onItemProductsPending?: (data: OrderGroup[]) => void;
    notDetails?: string;
    onValueInvocie?: (value: number) => void;
    onValidatedProducts?: (product: ProductoPedido) => void;
}

export const ProductValidationOrderRefused = ({
    onFinalize,
    onErrorAlert,
    onSuccessAlet,
    onStatusNovelty,
    shouldAutoValidate,
    modalStatusNovelty,
    onCloseReportPorduct,
    data,
    messages,
    dataPorduct,
    token,
    onItemData,
    refreshing,
    onRefreshing,
    onItemProductsPending,
    notDetails,
    onValueInvocie,
    onValidatedProducts,
}: ProductValidationOrderRefusedProps) => {
    const [allProducts, setAllProducts] = useState<OrderGroup[]>(dataPorduct || []);
    const [validatedProducts, setValidatedProducts] = useState<ProductoPedido | null>();
    const [showValidatedModal, setShowValidatedModal] = useState(false);
    const [showFinishAlert, setFinishAlert] = useState(false);
    const [currentValidationType, setCurrentValidationType] = useState<'success' | 'warning' | 'error' | 'null'>('null');
    const [showDirection, setDirection] = useState<'left' | 'right' | null>(null);
    const [tatolValue, setTotal] = useState(0);
    const [idValue, setIdValue] = useState(0);
    const [totalUnits, setTotalUnits] = useState(0);
    const [serviceToken, setServiceToken] = useState("");
    const [serviceUrl, setBaseUrl] = useState("");
    // VARIABLES NUEVAS - Separar productos según condiciones
    const [productsPending, setProductsPending] = useState<any[]>([]);
    const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);
    const [currentProduct, setCurrentProduct] = useState<any | null>(null);

    useEffect(() => {
        if (showDirection) {
            onStatusNovelty?.(showDirection);
            setDirection(null);
        }

    }, [showDirection]);

    useEffect(() => {
        if (validatedProducts) {
            onValidatedProducts?.(validatedProducts);
            setValidatedProducts(null);
        }

    }, [validatedProducts]);


    useEffect(() => {
        if (productsPending.length > 0) {
            onItemProductsPending?.(productsPending);
        }
    }, [productsPending]);

    useEffect(() => {
        if (dataPorduct && dataPorduct.length > 0) {
            setAllProducts(dataPorduct);
        }
    }, [dataPorduct]);


    useEffect(() => {
        if (onErrorAlert || onSuccessAlet) {
            const validationType = onErrorAlert ? 'error' : 'success';
            setFinishAlert(true);
            validateAllProducts(validationType);
            setCurrentValidationType(validationType);
        }
    }, [onErrorAlert, onSuccessAlet]);

    const validateAllProducts = (validationType: 'success' | 'warning' | 'error' = 'success') => {
        if (allProducts.length === 0) return;
    };

    const handleValidate = (id: number, direction: 'left' | 'right') => {
        if (data && data.length > 0) {
            setIdValue(id);

            // Buscar el producto en todos los documentos
            let product: any | undefined;
            for (const order of allProducts) {
                if (order.productos && Array.isArray(order.productos)) {
                    const found = order.productos.find(p => p.id === id);
                    if (found) {
                        product = found;
                        break;
                    }
                }
            }

            const totalUnits = data.reduce((sum, item) => sum + item.units, 0);
            setTotalUnits(totalUnits);
            setTotal(Number(totalUnits));
        }
    };

    const handleFinalize = () => {
        try {
            const allRejectedValid = allProducts.every((pedido) =>
                pedido.productos.every((producto) => {
                    return Number(producto.unidades_rechazadas || 0) > 0;
                })
            );

            if (allRejectedValid) {
                console.log("onFinalize_ ");
                
                onFinalize?.();
                onValueInvocie?.(valueRealTotal);
                setShowValidatedModal(true);
            }

        } catch (error) {
            throw error;
        }
    };

    const allRejectedValid = allProducts.every((pedido) =>
        pedido.productos.every(
            (producto) => Number(producto.unidades_rechazadas || 0) > 0
        )
    );

    // Función para obtener todos los productos pendientes
    const getAllPendingProducts = () => {
        const pendingProducts: any[] = [];
        allProducts.forEach(order => {
            if (order.productos && Array.isArray(order.productos)) {
                pendingProducts.push(...order.productos);
            }
        });
        return pendingProducts;
    };

    const pendingProductsFlat = getAllPendingProducts();

    useEffect(() => {
        const loadSecureData = async () => {
            const testTokenProduct = await SecureStore.getItemAsync('service_token_product');
            const testUrlProduct = await SecureStore.getItemAsync('base_url_product');
            const testToken = await SecureStore.getItemAsync('service_token');
            const testUrl = await SecureStore.getItemAsync('base_url');

            setServiceToken(testTokenProduct || "");
            setBaseUrl(testUrlProduct || "");
        };
        loadSecureData();
    }, []);

    const [productsByStatus, setProductsByStatus] = useState<{
        pending: Map<number, number>;
        validated: Map<number, number>;
        unidadesEntregadas: Map<number, number>;
    }>({
        pending: new Map(),
        validated: new Map(),
        unidadesEntregadas: new Map(),
    });

    const totalGeneral = Array.from(productsByStatus.pending.values())
        .reduce((sum, value) => sum + value, 0);

    const totalGeneralValidate = Array.from(productsByStatus.validated.values())
        .reduce((sum, value) => sum + value, 0);

    // Valor a recaudar estimado: validados + por validar
    const valueRealTotal = totalGeneralValidate + totalGeneral;

    // Función para actualizar el estado de un producto
    const updateProductStatus = (
        id: number,
        totalProductsValue: number,
        status: 'pending' | 'validated',
        unidadesEntregadas?: number | null
    ) => {
        setProductsByStatus(prev => {
            const newState = {
                pending: new Map(prev.pending),
                validated: new Map(prev.validated),
                unidadesEntregadas: new Map(prev.unidadesEntregadas),
            };

            const delivered = unidadesEntregadas ?? 0;

            if (status === 'validated') {
                newState.pending.delete(id);

                if (delivered > 0) {
                    newState.validated.set(id, totalProductsValue);
                    newState.unidadesEntregadas.set(id, delivered);
                } else {
                    newState.validated.delete(id);
                    newState.unidadesEntregadas.delete(id);
                }
            } else {
                newState.validated.delete(id);
                newState.unidadesEntregadas.delete(id);
                newState.pending.set(id, totalProductsValue);
            }

            return newState;
        });
    };
    useEffect(() => {
        if (dataPorduct && dataPorduct.length > 0) {
            setAllProducts(dataPorduct);

            setProductsByStatus({
                pending: new Map(),
                validated: new Map(),
                unidadesEntregadas: new Map(),
            });

            const pendingProducts: any[] = [];
            dataPorduct.forEach(order => {
                if (order.productos && Array.isArray(order.productos)) {
                    pendingProducts.push(...order.productos);
                }
            });
            setProductsPending(pendingProducts);
        }
    }, [dataPorduct]);

    return (
        <View style={styles.mainContainer}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            >
                <View style={styles.container}>
                    {/* Mostrar productos pendientes */}
                    {pendingProductsFlat.length > 0 ? (
                        pendingProductsFlat.map((item, index) => {
                            return (
                                <ProductItemAceptation
                                    key={item.id}
                                    item={item}
                                    isLastItem={index === pendingProductsFlat.length - 1}
                                    onValidate={handleValidate}
                                    onPresssNovlety={(direction) => {
                                        setDirection(direction);
                                        setValidatedProducts(item);
                                    }}
                                    activeSwipeId={activeSwipeId}
                                    setActiveSwipeId={setActiveSwipeId}
                                    shouldAutoValidate={shouldAutoValidate}
                                    onCloseReport={(value) => onCloseReportPorduct?.(value)}
                                    testToken={serviceToken}
                                    testUrl={serviceUrl}
                                    onItemData={(data) => {
                                        if (data?.estado) {
                                            // onItemData?.(data);
                                        }
                                    }}
                                    refreshing={refreshing}
                                    onRefreshing={() => {
                                        onRefreshing?.();
                                    }}
                                    onDataProduct={(id, _totalProducts, unidadesEntregadas) => {

                                        const deliveredUnits = unidadesEntregadas
                                            ? unidadesEntregadas
                                            : item?.unidades_solicitadas;

                                        const deliveredValue = calculateVlueByPorducts(
                                            item,
                                            TypeCaculateValueEnum.ACTION_5,
                                            Number(deliveredUnits),
                                            undefined,
                                            Number(allProducts?.[0]?.porcentaje_dfr)
                                        );

                                        updateProductStatus(
                                            id,
                                            Number(deliveredValue),
                                            'pending',
                                            unidadesEntregadas
                                        );
                                    }}
                                    porcentajeDFR={Number(allProducts?.[0]?.porcentaje_dfr)}
                                    notDetails={notDetails}
                                />
                            );
                        })
                    ) : (
                        Array.from({ length: 4 }).map((_, i) => (
                            <ProductItemSkeleton key={i} />
                        ))
                    )}
                    <View style={styles.bottomSpacing} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={styles.buttonRow}>
                    <PrimaryButton
                        title="Confirmar"
                        onPress={handleFinalize}
                        disabled={!allRejectedValid}
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
        maxHeight: 500,
        marginTop: 12,
        backgroundColor: '#F9F9FA',
    },
    container: {
        flex: 1,
        paddingBottom: 0,
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
        zIndex: 1000,
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
