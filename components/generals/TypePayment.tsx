import { GuideDetails } from "@/src/features/tracking/domain/details/DetailsGuide";
import { TypeParameterValue } from "@/src/features/tracking/domain/invoices/InvoicesInterFace";
import { Image } from "expo-image";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface EvidencePhoto {
    id: string;
    uri: string;
    base64?: string;
}

interface TypePaymentProps {
    title: string;
    subTitle: string;
    onClose?: () => void;
    width?: number;
    onEfecty?: () => void;
    onQr?: () => void;
    onOthers?: () => void;
    guide?: GuideDetails | undefined;
    typeCash?: TypeParameterValue[];
}

export function TypePayment({
    title,
    subTitle,
    onClose,
    width = 360,
    onEfecty,
    onQr,
    onOthers,
    guide,
    typeCash
}: TypePaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const existValue = typeCash?.some(
        (item) => item.valor === guide?.pedidos?.[0]?.canal
    );

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backgroundOverlay} onPress={onClose} />

            <View style={[styles.container, { width }]}>
                <View style={[styles.track, { width }]} />

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subTitleLabel}>{subTitle}</Text>

                <View style={styles.evidenceThumbnailsContainer}>
                    <View style={styles.thumbnailsColumn}>
                        {!existValue  && (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={onEfecty}
                                disabled={isLoading}
                            >
                                <View style={styles.row}>
                                    <Image
                                        source={require("@/assets/icons/CashIcon.png")}
                                        style={styles.storeIconCash}
                                    />
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>
                                            {'Efectivo'}
                                        </Text>
                                        <Text style={styles.cardSub} numberOfLines={2}>
                                            Pago directo en billetes al momento de la entrega.
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}


                        <TouchableOpacity
                            style={styles.card}
                            onPress={onQr}
                            disabled={isLoading}
                        >
                            <View style={styles.row}>
                                <Image
                                    source={require("@/assets/icons/Others.png")}
                                    style={styles.storeIcon}
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.cardTitle}>
                                        {'QR de pago'}
                                    </Text>
                                    <Text style={styles.cardSub} numberOfLines={2}>
                                        Pago digital escaneando un QR desde la app del cliente.
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {!existValue  && (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={onOthers}
                                disabled={isLoading}
                            >
                                <View style={styles.row}>
                                    <Image
                                        source={require("@/assets/icons/Others.png")}
                                        style={styles.storeIcon}
                                    />
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>
                                            {'Otros'}
                                        </Text>
                                        <Text style={styles.cardSub} numberOfLines={2}>
                                            Pagos previos, abonos o acuerdos comerciales especiales.
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}

                    </View>
                </View>

                <View style={{ height: 20 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: 100,
    },
    storeIconCash: {
        width: 24,
        height: 24,
    },
    storeIcon: {
        width: 20,
        height: 20,
    },
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: 32,
        position: "relative",
        paddingBottom: 20,
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    track: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 20,
    },
    closeText: {
        color: "#788095",
        fontSize: 26,
        fontWeight: "bold",
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 22,
        fontWeight: "700",
        color: "#141D32",
        marginBottom: 8,
    },
    subTitleLabel: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 18,
        color: "#788095",
        marginBottom: 25,
    },
    evidenceThumbnailsContainer: {
        marginBottom: 10,
    },
    thumbnailsColumn: {
        flexDirection: "column",
        gap: 8,
    },
    card: {
        width: '100%',
        minHeight: 67,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#E6E8EC",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    textContainer: {
        flex: 1,
        flexShrink: 2,
        justifyContent: "center",
    },

    cardTitle: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "600",
        color: "#141D32",
        marginBottom: 2,
    },
    cardSub: {
        fontFamily: "Rubik",
        fontSize: 12,
        fontWeight: "400",
        color: "#788095",
        lineHeight: 16,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: "#F9F9FA",
        justifyContent: "center",
        alignItems: "center",
    },
});