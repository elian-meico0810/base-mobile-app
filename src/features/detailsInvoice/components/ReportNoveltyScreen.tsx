import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

// Interface basada en la estructura exacta del JSON
interface PaymentItem {
    id: number;
    numeroDeposito: string;
    fechaDeposito: string;
    valorPagado: string;
    canal: string;
    numeroDocumento: string;
    estado: string;
    referencia: string;
}

interface ReportNoveltysProps {
    title: string;
    onPress?: (data: ReasonData[]) => void; // Modificado para recibir datos
    onClose?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
    showViewModal?: boolean;
}

// Interface para los datos de razón
interface ReasonData {
    type: string;
    units: number;
    description?: string;
}

export function ReportNoveltyScreen({
    title,
    onPress,
    onClose,
    disabled = false,
    width = 360,
    height = 500,
    showViewModal =false
}: ReportNoveltysProps) {
    const [units, setUnits] = useState<string[]>(["", "", "", ""]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [hasValues, setHasValues] = useState(false); // Nuevo estado
    
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

    // Función separada para verificar valores
    const checkForValues = (unitsArray: string[]) => {
        const hasAny = unitsArray.some(unit => {
            if (unit === "" ) return false;
            const unitValue = parseInt(unit, 10);
            return !isNaN(unitValue);
        });

        setHasValues(hasAny);
    };

    // FUNCIÓN MODIFICADA: Ya no borra los otros inputs
    const handleInputFocus = (index: number) => {
        // Solo actualiza el índice enfocado, sin borrar otros inputs
        setFocusedIndex(index);
    };

    const handleInputBlur = () => {
        setFocusedIndex(null);
    };

    const reasons = [
        "Dinero insuficiente",
        "Producto dañado",
        "Producto vencido",
        "Otro"
    ];

    // Función para obtener los datos estructurados
    const getReasonValues = (): ReasonData[] => {
        const data: ReasonData[] = [];

        reasons.forEach((reason, index) => {
            const unitValue = units[index] ? parseInt(units[index], 10) : 0;
            if (unitValue >= 0) {
                data.push({
                    type: reason,
                    units: unitValue
                });

            }
        });

        return data;
    };

    useEffect(() => {
        // Verificar inicialmente
        checkForValues(units);

    }, []);

    const handleFinalize = () => {
        try {
            Keyboard.dismiss();

            if (units.length >= 0) {
                // Obtener los datos estructurados
                const reasonData = getReasonValues();
                if (reasonData.length >= 0) {

                    // Enviar los datos al padre si existe la función onPress
                    if (onPress) {
                        onPress(reasonData);
                    }

                    // Cerrar el modal después de enviar
                    if (onClose) {
                        setTimeout(onClose, 300);
                    }
                    setHasValues(false);
                    setUnits(['']);
                }
            }

        } catch (error) {
            throw error;
        }

    };

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: e.endCoordinates.height,
                    useNativeDriver: false,
                }).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: 0,
                    useNativeDriver: false,
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.touchableOverlay}>
                    {/* Fondo gris */}
                    <TouchableOpacity
                        style={styles.backgroundOverlay}
                        onPress={handleClose}
                        activeOpacity={1}
                    />

                    <Animated.View
                        style={[
                            styles.container,
                            {
                                width,
                                height,
                                marginBottom: keyboardHeight
                            }
                        ]}
                    >
                        {/* Fondo blanco redondeado */}
                        <View style={styles.track} />

                        {/* Botón cerrar */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>

                        {/* Título */}
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{title}</Text>
                        </View>

                        {/* Descripción */}
                        <Text>
                            <Text style={styles.description}>
                                Elige el motivo e ingresa la cantidad de unidades
                            </Text>
                            <Text style={styles.subTitle}>
                                {" "}que rechazo el cliente
                            </Text>
                        </Text>

                        {/* CONTENEDOR ÚNICO DE NOVEDADES */}
                        <View style={styles.noveltyBox}>
                            {reasons.map((reason, index) => (
                                <View key={index} style={styles.reasonRow}>
                                    <Text style={styles.reasonText}>{reason}</Text>
                                    <TextInput
                                        style={[
                                            styles.unitsPlaceholder,
                                            focusedIndex === index && styles.unitsPlaceholderFocused,
                                            units[index] !== "" && styles.unitsPlaceholderFilled
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
                        </View>
                        {/* Botón Confirmar - ahora se habilita cuando hay valores */}
                        <View style={styles.buttonRow}>
                            <PrimaryButton
                                title={'Confirmar '}
                                onPress={handleFinalize}
                                disabled={!hasValues} // Usamos el estado separado
                                width={348}
                                height={43}
                            />

                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
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
    touchableOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        width: '100%',
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
        position: "relative",
        padding: 16,
        zIndex: 10000,
        backgroundColor: "transparent",
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
    clearButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E6E8EC',
    },
    clearButtonText: {
        fontFamily: 'Rubik',
        fontSize: 12,
        fontWeight: '500',
        color: '#788095',
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
    unitsPlaceholderFilled: {
        backgroundColor: "#F0F7FF",
        borderColor: "#B7C8EE",
    },
    noveltyBox: {
        marginTop: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E6E8EC",
        overflow: "hidden",
    },
    buttonRow: {
        alignItems: 'center',
        marginTop: 10,
    },
    debugContainer: {
        backgroundColor: '#F5F7FA',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#E6E8EC',
    },
    debugText: {
        fontFamily: 'Rubik',
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    debugButton: {
        width: 348,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    debugButtonText: {
        fontFamily: 'Rubik',
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
});