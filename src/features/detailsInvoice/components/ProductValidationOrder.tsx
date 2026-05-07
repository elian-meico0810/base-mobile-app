import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ProductItemSkeleton } from '@/components/skeleton/ProductItemSkeleton';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { AceptationOrderDetails, Detail, Document } from '../../tracking/domain/details/DetailsGuide';
import { ProductItemOrder } from './ProductItemOrder';
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

interface ProductValidationOrderSectionProps {
    onFinalize?: () => void;
    onSuccessAlet: () => void;
    dataPorduct?: AceptationOrderDetails[];
    token?: string;
}

export const ProductValidationOrder = ({
    onFinalize,
    onSuccessAlet,
    dataPorduct,
    token,

}: ProductValidationOrderSectionProps) => {
    const [allProducts, setAllProducts] = useState<AceptationOrderDetails[]>(dataPorduct || []);
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


    console.log("dataPorduct_ ", dataPorduct);

    useEffect(() => {
        if (dataPorduct && dataPorduct.length > 0) {
            setAllProducts(dataPorduct);
        }
    }, [dataPorduct]);







    const handleFinalize = () => {
        try {
            if (productsPending.length == 0) {
                onFinalize?.();
            }
        } catch (error) {
            throw error;
        }
    };


    useEffect(() => {
        // if (serviceUrl == "" || serviceToken == "") {
        const loadSecureData = async () => {

            const testTokenProduct = await SecureStore.getItemAsync('service_token_product');
            const testUrlProduct = await SecureStore.getItemAsync('base_url_product');

            const testToken = await SecureStore.getItemAsync('service_token');
            const testUrl = await SecureStore.getItemAsync('base_url');

            // console.log("testTokenProduct: ",testTokenProduct);
            // console.log("testUrlProduct: ",testUrlProduct);

            setServiceToken(testTokenProduct || "");
            setBaseUrl(testUrlProduct || "");

        };
        loadSecureData();

        // }
    }, []);





    console.log("allProducts.length: ", allProducts.length);

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
                    {allProducts.length > 0 ? (
                        allProducts.map((item, index) => (
                            <ProductItemOrder
                                key={`${item.id}-${index}`}
                                item={item}
                                testToken={serviceToken}
                                testUrl={serviceUrl}
                            />
                        ))
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
                        title="Finalizar"
                        onPress={handleFinalize}
                        disabled={true}
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
