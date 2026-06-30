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

interface ChangePhoneModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (phone: string) => void;
    onAlert: () => void;
}

export function ChangePhoneModal({ visible, onClose, onConfirm, onAlert }: ChangePhoneModalProps) {
    const [phone, setPhone] = useState("");
    const [keyboardHeight] = useState(new Animated.Value(0));
    const isValid = phone.length === 10;

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
        setTimeout(onClose, 100);
    };

    useEffect(() => {
        if (visible) {
            keyboardHeight.setValue(0);
        }
    }, [visible]);

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
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={handleClose}
                    />

                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { marginBottom: keyboardHeight }
                        ]}
                    >
                        <View style={styles.modal}>
                            <Text style={styles.title}>Cambiar número de teléfono</Text>
                            <Text style={styles.description}>
                                Ingresa el nuevo número al que se le enviará el QR de pago
                            </Text>

                            <TextInput
                                value={phone}
                                onChangeText={(text) => {
                                    const onlyNumbers = text.replace(/[^0-9]/g, '');
                                    setPhone(onlyNumbers);
                                }}
                                style={styles.input}
                                placeholder="Número de teléfono"
                                keyboardType="number-pad"
                                maxLength={10}
                                autoFocus={true}
                            />

                            <PrimaryButton
                                title="Confirmar"
                                onPress={() => {
                                    if (!isValid) return;
                                    Keyboard.dismiss();
                                    setTimeout(() => {
                                        onConfirm(phone);
                                        onClose();
                                        onAlert();
                                        setPhone("");
                                    }, 300);
                                }}
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
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        justifyContent: "flex-end",
    },
    modal: {
        width: '100%',
        maxWidth: 400, 
        alignSelf: 'center',
        backgroundColor: "#FFFFFF",
        padding: '5%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 280,
    },
    title: {
        fontFamily: "Rubik",
        fontWeight: "800",
        fontSize: 18,
        color: "#141D32",
    },
    description: {
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 14,
        color: "#788095",
        marginTop: 4,
        marginBottom: 16,
    },
    input: {
        width: '100%', 
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#DADCE3",
        paddingHorizontal: 12,
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 16,
        color: "#141D32",
        marginBottom: 20,
    },
});