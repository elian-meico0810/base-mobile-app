import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ProductItemSkeleton } from '@/components/skeleton/ProductItemSkeleton';
import { TypeCaculateValueEnum } from '@/src/constants/GuideStates';
import { calculateVlueByPorducts, formatNumber } from '@/src/utils/uitls';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Detail, Document } from '../../tracking/domain/details/DetailsGuide';
import { ProductItem } from './ProductItem';
const { width, height } = Dimensions.get('window');


interface ReasonData {
    type: string;
    units: number;
    description?: string;
}

interface FinalizedData {
    validatedCount: number;
    pendingCount: number;
    totalValue: number;
    totalValueSuccess: number;
    totalValueWarning: number;
    validatedProducts: Document[];
    statistics: {
        successCount: number;
        warningCount: number;
    };
}

interface ProductValidationSectionProps {
    onFinalize?: () => void;
    onErrorAlert?: boolean;
    onSuccessAlet?: boolean;
    onStatusNovelty?: (direction: 'left' | 'right' | null) => void;
    shouldAutoValidate?: boolean;
    modalStatusNovelty?: string | null;
    onCloseReportPorduct?: (value: boolean) => void;
    data?: ReasonData[];
    messages?: (messages: string) => void;
    dataPorduct?: Document[];
    token?: string;
    onItemData?: (data: Detail) => void;
    refreshing?: boolean;
    onRefreshing?: () => void;
    onItemProductsPending?: (data: Detail[]) => void;
    notDetails?: string;
}

export const ProductValidationSection = ({
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
    notDetails
}: ProductValidationSectionProps) => {
    const [allProducts, setAllProducts] = useState<Document[]>(dataPorduct || []);
    const [validatedProducts, setValidatedProducts] = useState<Document[]>([]);
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
    const [productsSold, setProductsSold] = useState<Detail[]>([]);
    const [productsPending, setProductsPending] = useState<Detail[]>([]);
    const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);

    console.log("notDetails: ", notDetails);

    useEffect(() => {
        if (showDirection) {
            onStatusNovelty?.(showDirection);
        }
    }, [showDirection]);

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

    // Efecto para actualizar las variables separadas cuando cambien los productos
    useEffect(() => {
        const procesarProductos = () => {
            if (allProducts.length === 0) {
                setProductsSold([]);
                setProductsPending([]);
                return;
            }

            // Obtener todos los detalles de forma plana
            const todosDetalles: Detail[] = [];
            allProducts.forEach(doc => {
                todosDetalles.push(...doc.detalles);
            });

            // Separar según las condiciones
            const validados = todosDetalles.filter(item =>
                item.estado?.codigo === 'EST_DET_VALIDADO'
            );

            const pendientes = todosDetalles.filter(item =>
                item.estado?.codigo !== 'EST_DET_VALIDADO'
            );

            // Actualizar las variables
            setProductsSold(validados);
            setProductsPending(pendientes);

        };

        procesarProductos();
    }, [allProducts]);


    useEffect(() => {
        if (showDirection) {
            onStatusNovelty?.(showDirection);
        }
    }, [showDirection]);

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
            let product: Detail | undefined;
            for (const doc of allProducts) {
                const found = doc.detalles.find(p => p.id === id);
                if (found) {
                    product = found;
                    break;
                }
            }

            const totalUnits = data.reduce((sum, item) => sum + item.units, 0);
            setTotalUnits(totalUnits);
            setTotal(Number(totalUnits));

            // if (product && totalUnits > Number(product.unidadesSolicitadas)) {
            //     messages?.("La cantidad reportada no puede ser mayor a la despachada.");
            //     return;
            // } else if (product && totalUnits == Number(product.unidadesSolicitadas)) {
            //     messages?.("La cantidad reportada no puede ser igual a la despachada.");
            //     return;
            // } else {

            // }

        }


    };
    // Calcular estadísticas CORREGIDAS
    const pendingCount = allProducts.reduce((total, doc) => {
        // Filtrar los detalles que NO están validados y sumar
        const detallesNoValidados = doc.detalles.filter(detalle =>
            detalle?.estado?.codigo !== 'EST_DET_VALIDADO'
        );
        return total + detallesNoValidados.length;
    }, 0);


    const validatedCount = allProducts.reduce((total, doc) => {
        const detallesValidados = doc.detalles.filter(detalle =>
            detalle?.estado?.codigo === 'EST_DET_VALIDADO'
        );
        return total + detallesValidados.length;
    }, 0);

    const totalProducts = pendingCount + validatedCount;
    const progressPercentage = totalProducts > 0 ? (validatedCount / totalProducts) * 100 : 0;

    const isValid = pendingCount === 0;

    const handleFinalize = () => {
        try {
            if (productsPending.length == 0) {
                onFinalize?.();
                setShowValidatedModal(true);
            }
        } catch (error) {
            throw error;
        }
    };


    // Función para obtener todos los detalles pendientes
    const getAllPendingDetails = () => {
        const pendingDetails: Detail[] = [];
        allProducts.forEach(doc => {
            pendingDetails.push(...doc.detalles);
        });
        return pendingDetails;
    };

    const pendingDetailsFlat = getAllPendingDetails();

    // Función para obtener todos los detalles validados
    const getAllValidatedDetails = () => {
        const validatedDetails: Detail[] = [];
        validatedProducts.forEach(doc => {
            validatedDetails.push(...doc.detalles);
        });
        return validatedDetails;
    };

    useEffect(() => {
        // if (serviceUrl == "" || serviceToken == "") {
        const loadSecureData = async () => {

            const testToken = await SecureStore.getItemAsync('service_token');
            const testUrl = await SecureStore.getItemAsync('base_url');

            setServiceToken(testToken || "");
            setBaseUrl(testUrl || "");

        };
        loadSecureData();

        // }
    }, []);

    const hasItemsToValidate = pendingDetailsFlat.some(item =>
        item.estado?.codigo !== 'EST_DET_VALIDADO'
    );

    const hasItemsValidateSuccess = pendingDetailsFlat.some(item =>
        item.estado?.codigo === 'EST_DET_VALIDADO'
    );

    const [productsByStatus, setProductsByStatus] = useState<{
        pending: Map<number, number>;
        validated: Map<number, number>;
        unidadesEntregadas: Map<number, number>;
    }>({
        pending: new Map(),
        validated: new Map(),
        unidadesEntregadas: new Map(),
    });

    // console.log("productsByStatus: ",productsByStatus);

    // 2. Calcula los totales basados en los Maps
    const totalGeneral = Array.from(productsByStatus.pending.values())
        .reduce((sum, value) => sum + value, 0);

    const totalGeneralValidate = Array.from(productsByStatus.validated.values())
        .reduce((sum, value) => sum + value, 0);

    // Valor a recaudar estimado: validados + por validar
    const valueRealTotal = totalGeneralValidate + totalGeneral

    // 3. Función para actualizar el estado de un producto
    const updateProductStatus = (
        id: number,
        totalProducts: number,
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
                    newState.validated.set(id, totalProducts);
                    newState.unidadesEntregadas.set(id, delivered);
                } else {
                    newState.validated.delete(id);
                    newState.unidadesEntregadas.delete(id);
                }
            } else {
                newState.validated.delete(id);
                newState.unidadesEntregadas.delete(id);
                newState.pending.set(id, totalProducts);
            }

            return newState;
        });
    };

    return (
        <View style={styles.mainContainer}>
            {(hasItemsToValidate && pendingDetailsFlat.length > 0) && (
                <View style={styles.subtitleContainer}>
                    <Text style={styles.headerTSubitle}>Por validar</Text>
                </View>
            )}

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            >
                <View style={styles.container}>
                    {/* Mostrar productos pendientes */}
                    {pendingDetailsFlat.length > 0 ? (
                        pendingDetailsFlat.filter(item => {
                            // Aquí aplicas tu condición de filtro
                            return item.estado?.codigo !== 'EST_DET_VALIDADO';

                        }).map((item, index) => (
                            <ProductItem
                                key={item.id}
                                item={item}
                                isLastItem={index === pendingDetailsFlat.length - 1}
                                onValidate={handleValidate}
                                onPresssNovlety={(direction) => {
                                    setDirection(direction);
                                }}
                                activeSwipeId={activeSwipeId}
                                setActiveSwipeId={setActiveSwipeId}
                                shouldAutoValidate={shouldAutoValidate}
                                onCloseReport={(value) => onCloseReportPorduct?.(value)}
                                testToken={serviceToken}
                                testUrl={serviceUrl}
                                onItemData={(data) => {
                                    if (data?.estado) {
                                        onItemData?.(data);

                                    }
                                }}
                                refreshing={refreshing}
                                onRefreshing={() => {
                                    onRefreshing?.();
                                }}
                                onDataProduct={(id, _totalProducts, unidadesEntregadas) => {
                                    const deliveredUnits = unidadesEntregadas ? unidadesEntregadas : item?.unidadesSolicitadas;
                                    const deliveredValue = calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_5, Number(deliveredUnits), undefined, Number(allProducts?.[0]?.porcentajeDFR));
                                    updateProductStatus(id, Number(deliveredValue), 'pending', unidadesEntregadas);

                                    // console.log("========================================");
                                    // console.log("=========== LOS POR VALIDAR ====================");
                                    // console.log("id:", id, "totalProducts:", totalProducts, "unidadesEntregadas: ", unidadesEntregadas);
                                    // console.log("TOTAL ACUMULADO:", totalGeneral);
                                    // console.log("========================================");
                                }}
                                porcentajeDFR={Number(allProducts?.[0]?.porcentajeDFR)}
                                notDetails={notDetails}
                            />
                        ))
                    ) : (
                        Array.from({ length: 4 }).map((_, i) => (
                            <ProductItemSkeleton key={i} />
                        ))
                    )}


                    {/* Mostrar productos validados */}
                    {pendingDetailsFlat.length > 0 && (
                        <>
                            {(showFinishAlert || hasItemsValidateSuccess) && (
                                <View style={styles.subtitleContainer}>
                                    <Text style={styles.headerTSubitle}>Validados</Text>
                                </View>
                            )}

                            {pendingDetailsFlat
                                .filter(item => item.estado?.codigo === 'EST_DET_VALIDADO')
                                .map((item, index, filteredArray) => (
                                    <ProductItem
                                        key={item.id}
                                        item={item}
                                        isLastItem={index === filteredArray.length - 1}
                                        onValidate={handleValidate}
                                        onPresssNovlety={(direction) => {
                                            setDirection(direction);
                                        }}
                                        activeSwipeId={activeSwipeId}
                                        setActiveSwipeId={setActiveSwipeId}
                                        shouldAutoValidate={shouldAutoValidate}
                                        onCloseReport={(value) => onCloseReportPorduct?.(value)}
                                        testToken={serviceToken}
                                        testUrl={serviceUrl}
                                        onItemData={(data) => {
                                            if (data?.estado) {
                                                onItemData?.(data);
                                            }
                                        }}
                                        refreshing={refreshing}
                                        onRefreshing={() => {
                                            onRefreshing?.();
                                        }}
                                        onDataProduct={(id, _totalProducts, unidadesEntregadas) => {
                                            const deliveredUnits = unidadesEntregadas ?? item?.unidadesEntregadas ?? 0;
                                            const deliveredValue = calculateVlueByPorducts(item, TypeCaculateValueEnum.ACTION_5, Number(deliveredUnits), undefined, Number(allProducts?.[0]?.porcentajeDFR));
                                            updateProductStatus(id, Number(deliveredValue), 'validated', unidadesEntregadas);
                                        }}
                                        porcentajeDFR={Number(allProducts?.[0]?.porcentajeDFR)}
                                        notDetails={notDetails}
                                    />
                                ))}
                        </>
                    )}

                    <View style={styles.bottomSpacing} />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <View style={styles.progressRow}>
                    {pendingCount > 0 ? (
                        <Text style={styles.pendingText}>
                            Te faltan{' '}
                            <Text style={styles.pendingBold}>{pendingCount} productos</Text>
                            {' '}por validar
                        </Text>
                    ) : (
                        <Text style={styles.pendingText}>
                            Productos validados
                        </Text>
                    )}

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

                {/* {(allProducts?.[0]?.condicionPago?.codigo === TypeInvoiceEnum.CREDITO ||
                    allProducts?.[0]?.condicionPago?.codigo === TypeInvoiceEnum.CONTADO_EFECTIVO ? ( */}
                {!notDetails ? (
                        <View style={styles.valueRow}>
                            <Text style={styles.valueLabel}>Valor a recaudar:</Text>
                            <Text style={styles.valueAmount}>$ {formatNumber(Number(valueRealTotal))}</Text>
                        </View>
                    ) : null
                }

                {/* // ) : null
                // )} */}

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
