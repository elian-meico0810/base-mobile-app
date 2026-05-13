import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import {
    Animated,
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

interface ChangeCodeModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (phone: string) => void;
    onAlert: () => void;
}

export function ChangeCodeModal({
    visible,
    onClose,
    onConfirm,
    onAlert
}: ChangeCodeModalProps) {
    const [code, setCode] = useState("");
    const [keyboardHeight] = useState(new Animated.Value(0));
    
    const isValid = code.length === 6;

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: -e.endCoordinates.height + 20,
                    useNativeDriver: true,
                }).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
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
        setTimeout(() => {
            setCode("");
            onClose();
        }, 100);
    };

    useEffect(() => {
        if (visible) {
            keyboardHeight.setValue(0);
            setCode("");
        }
    }, [visible]);

    const handleConfirm = () => {
        if (!isValid) return; 
        
        Keyboard.dismiss();
        
        setTimeout(() => {
            onConfirm(code);
            onAlert(); 
            onClose();
            setCode("");
        }, 300);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
            presentationStyle="overFullScreen"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                transform: [
                                    { translateY: keyboardHeight }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.modal}>
                            {/* Botón cerrar */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>

                            <Text style={styles.title}>
                                Código de verificación
                            </Text>

                            <Text style={styles.description}>
                                Ingresa el código proporcionado por tu supervisor
                                para confirmar esta novedad.
                            </Text>

                            <TextInput
                                value={code}
                                onChangeText={(text) => {
                                    const onlyNumbers = text.replace(/[^0-9]/g, '');
                                    setCode(onlyNumbers);
                                }}
                                style={[
                                    styles.input,
                                    {
                                        width: 350,
                                        height: 43,
                                    }
                                ]}
                                placeholder="Código de verificación"
                                keyboardType="number-pad"
                                maxLength={6}
                                autoFocus={true}
                            />

                            <PrimaryButton
                                title="Confirmar"
                                onPress={handleConfirm}
                                width={350}
                                height={43}
                                disabled={!isValid}
                            />
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    modalContainer: {
        justifyContent: "flex-end",
    },
    modal: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 280,
        maxHeight: "70%",
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: 18,
        right: 18,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    closeText: {
        color: "#141D32",
        fontSize: 18,
        fontWeight: "700",
        lineHeight: 20,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 18,
        color: "#141D32",
        marginTop: 10,
    },
    description: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 14,
        color: "#788095",
        marginBottom: 8,
    },
    input: {
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#DADCE3",
        paddingHorizontal: 12,
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 16,
        color: "#141D32",
        marginBottom: 8,
    },
    counterText: {
        fontFamily: "Rubik",
        fontSize: 12,
        color: "#788095",
        marginBottom: 20,
        textAlign: "right",
    },
    counterTextValid: {
        color: "#4CAF50",
        fontWeight: "600",
    },
});