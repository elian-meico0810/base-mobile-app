import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Cause } from "../../tracking/domain/details/DetailsGuide";

interface ReportNoveltysProps {
    title: string;
    onPress?: (data: ReasonData[]) => void;
    onClose?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    showViewModal?: boolean;
    showTypeDetails?: Cause[]
}

interface ReasonData {
    type: string;
    units: number;
    description?: string;
    codigo?: string;
}

export function ReportNoveltyScreen({
    title,
    onPress,
    onClose,
    disabled = false,
    width = 360,
    height = 500,
    showViewModal = false,
    showTypeDetails
}: ReportNoveltysProps) {
    const [units, setUnits] = useState<string[]>(["", "", "", ""]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [hasValues, setHasValues] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const translateY = useRef(new Animated.Value(0)).current;

    const handleUnitChange = (text: string, index: number) => {
        try {
            const numericText = text.replace(/[^0-9]/g, '');
            const newUnits = [...units];
            newUnits[index] = numericText;
            setUnits(newUnits);
            checkForValues(newUnits);
        } catch (error) {
            throw error;
        }
    };

    const checkForValues = (unitsArray: string[]) => {
        const hasAny = unitsArray.some(unit => {
            if (unit === "") return false;
            const unitValue = parseInt(unit, 10);
            return !isNaN(unitValue);
        });
        setHasValues(hasAny);
    };

    const handleInputFocus = (index: number) => {
        setFocusedIndex(index);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: index * 80,
                animated: true
            });
        }, 100);
    };

    const handleInputBlur = () => {
        setFocusedIndex(null);
    };

    const reasons = showTypeDetails?.map(item => item.nombre);

    const getReasonValues = (): ReasonData[] => {
        const data: ReasonData[] = [];
        if (!showTypeDetails || !reasons) return [];

        reasons?.forEach((reason, index) => {
            const unitValue = units[index] ? parseInt(units[index], 10) : 0;
            data.push({
                type: reason,
                units: unitValue,
                codigo: showTypeDetails[index]?.codigo
            });
        });
        return data;
    };

    useEffect(() => {
        checkForValues(units);
    }, []);

    const handleFinalize = () => {
        if (hasValues) {

            Keyboard.dismiss();
            const reasonData = getReasonValues();
            onPress?.(reasonData);
            setHasValues(false);
            setUnits(["", "", "", ""]);
            onClose?.();
        }

    };

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
                Animated.timing(translateY, {
                    duration: 300,
                    toValue: -e.endCoordinates.height,
                    useNativeDriver: true,
                }).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
                Animated.timing(translateY, {
                    duration: 300,
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    const handleClose = () => {
        Keyboard.dismiss();
        if (onClose) {
            setTimeout(onClose, 100);
        }
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity
                style={styles.backgroundOverlay}
                onPress={handleClose}
                activeOpacity={1}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <Animated.View
                    style={[
                        styles.container,
                        {
                            width,
                            height,
                            transform: [{ translateY }]
                        }
                    ]}
                >
                    <View style={styles.track} />

                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    <Text>
                        <Text style={styles.description}>
                            Elige el motivo e ingresa la cantidad de unidades
                        </Text>
                        <Text style={styles.subTitle}>
                            {" "}que rechazo el cliente
                        </Text>
                    </Text>

                    <View>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.noveltyBox}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            {reasons?.map((reason, index) => (
                                <View key={index} style={styles.reasonRow}>
                                    <Text style={styles.reasonText}>{reason}</Text>
                                    <TextInput
                                        style={[
                                            styles.unitsPlaceholder,
                                            focusedIndex === index && styles.unitsPlaceholderFocused,
                                        ]}
                                        value={units[index]}
                                        onChangeText={(text) => handleUnitChange(text, index)}
                                        onFocus={() => handleInputFocus(index)}
                                        onBlur={handleInputBlur}
                                        placeholder="Unidades"
                                        placeholderTextColor="#DDDFE8"
                                        keyboardType="numeric"
                                        maxLength={4}
                                        textAlign="center"
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.buttonRow}>
                        <PrimaryButton
                            title={'Confirmar'}
                            onPress={handleFinalize}
                            disabled={!hasValues}
                            width={348}
                            height={43}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
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
        zIndex: 9999,
    },
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    keyboardAvoidingView: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    container: {
        position: "relative",
        padding: 16,
        zIndex: 10000,
        backgroundColor: "transparent",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    track: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
    },
    closeText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#788095",
    },
    titleContainer: {
        marginBottom: 16,
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 18,
        fontWeight: "800",
        color: "#141D32",
    },
    description: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "600",
        color: "#788095",
    },
    subTitle: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "800",
        color: "#788095",
    },
    reasonRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    reasonText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14,
        color: '#141D32',
    },
    unitsPlaceholder: {
        width: 88,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E6E8EC",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '400',
        color: '#141D32',
        padding: 0,
    },
    unitsPlaceholderFocused: {
        borderWidth: 2,
        borderColor: "#B7C8EE",
    },
    noveltyBox: {
        marginTop: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E6E8EC",
        overflow: "hidden",
        maxHeight: 260,
    },
    buttonRow: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 60,
    },
});