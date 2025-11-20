import { DetailsGudes } from '@/components/generals/DetailsGudes';
import { NetworkStatus } from '@/components/generals/NetworkStatus';
import { TodayDeliveries } from '@/components/generals/TodayDeliveries';
import { SearchInput } from '@/components/inputs/SearchInput';
import { ThemedView } from '@/components/themed-view';
import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { detailsRepositoryImpl } from '@/src/features/tracking/infrastructure/details/detailsRepositoryImpl';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from "react-native";

const { width, height } = Dimensions.get('window');

interface DetailsFormProps {
    initialGuide?: string;
    token?: string;
    onSubmit: (params: { guide: string; token: string }) => void | Promise<void>;
}

export function DetailsForm({ initialGuide = "", token = "", onSubmit }: DetailsFormProps) {
    const [guide, setGuide] = useState(initialGuide);
    const [tokenUser, setToken] = useState<string | null>(null);
    const [data, setData] = useState<GuideDetails[]>([]);
    const [filteredGuides, setFilteredGuides] = useState(data);
    useEffect(() => {
        const fetchToken = async () => {
            const savedToken = await SecureStore.getItemAsync('user_token');
            setToken(savedToken);
        };
        fetchToken();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const response = await detailsRepositoryImpl.listGuide(Number(guide), tokenUser || token);
            if (response?.statusCode == 200) {
                if (response?.data) {
                    const arrayData = Array.isArray(response.data) ? response.data : [response.data];
                    setData(arrayData as GuideDetails[]);
                    setFilteredGuides(arrayData as GuideDetails[]);
                }
            } else {
                setData([]);
                setFilteredGuides([]);
            }
        };
        fetchData();
    }, [guide, tokenUser || token]);

    return (
        <ThemedView style={styles.container}>
            <NetworkStatus />

            <View style={[styles.backgroundFill, { width, height }]} pointerEvents="none">
                <Image
                    source={require('@/assets/icons/Home.png')}
                    style={[styles.backgroundImage, { width, height }]}
                    resizeMode="cover"
                />
            </View>
            <DetailsGudes style={styles.logo} guide={Number(guide)} />

            {/* Panel blanco con altura fija */}
            <View style={[
                styles.whitePanel,
                { height: height - 200 }
            ]}>
                <View style={styles.content}>

                    <View style={styles.topContent}>
                        <TodayDeliveries
                            style={{ marginTop: -60 }}
                            data={data}
                        />
                        <Text style={styles.title}>Tu ruta</Text>
                        <SearchInput
                            data={data}
                            keyExtractor={(item) => `${item.nombreCliente} ${item.codigoCliente}`} // combina campos
                            onSearch={setFilteredGuides}
                            placeholder="Buscar por cliente o código"
                        />

                    </View>

                </View>
            </View>
        </ThemedView>
    );
}
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
    },
    backgroundFill: {
        backgroundColor: '#164194',
    },
    backgroundImage: {
        zIndex: 1,
    },
    separator: {
        position: 'absolute',
        height: 5,
        transform: [{ rotate: '-15deg' }],
        zIndex: 2,
    },
    logo: {
        zIndex: 10,
        position: 'absolute',
        top: 100,
    },
    whitePanel: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
        backgroundColor: '#F9F9FA',
        padding: 27,
        zIndex: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topContent: {
        flex: 1,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "700",
        fontSize: 24,
        textAlign: "left",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
        textAlign: "center",
    },
    buttonContainer: {
        width: "100%",
        alignItems: 'center',
    },
});