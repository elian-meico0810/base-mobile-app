import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OptionsRefusedProps {
    onPress?: (selectedStatus: 'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null) => void;
    onClose?: () => void;
    disabled?: boolean;
    width?: number;
    height?: number;
}

export function OptionsRefused({
    onClose,
    disabled = false,
    width = 360,
    height = 510,
    onPress
}: OptionsRefusedProps) {
    const [selectedStatus, setSelectedStatus] = useState<'Dinero' | 'Dueño' | 'Tienda' | 'Productos' | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Usar el prop height como valor inicial, pero luego controlarlo dinámicamente
    const [dynamicHeight, setDynamicHeight] = useState(height);

    const handleStatusSelect = (status: 'Dinero' | 'Dueño' | 'Tienda' | 'Productos') => {
        const newStatus = selectedStatus === status ? null : status;
        setSelectedStatus(newStatus);

        if (newStatus === 'Tienda') {
            setDynamicHeight(540);
        } else {
            setDynamicHeight(510);
        }
    };

    const handleSubmit = () => {
        if (selectedStatus) {
            onPress?.(selectedStatus);
        }
        onClose?.();
    }

    return (
        <View style={styles.overlay}>
            {/* Fondo gris semi-transparente */}
            <TouchableOpacity
                style={styles.backgroundOverlay}
                onPress={onClose}
                activeOpacity={1}
            />

            {/* Panel de contenido - USAR dynamicHeight aquí */}
            <View style={[styles.container, { width, height: dynamicHeight }]}>
                {/* Fondo del panel - USAR dynamicHeight aquí también */}
                <View style={[styles.track, { width, height: dynamicHeight }]} />

                {/* Botón de cerrar */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                {/* Título */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Motivo del rechazo</Text>
                    <Text style={styles.subTitle}>Selecciona el motivo correspondiente</Text>
                </View>

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                >

                    {/* Dinero insuficiente */}
                    <TouchableOpacity
                        style={[
                            styles.checkboxContainer,
                            selectedStatus === 'Dinero' && styles.checkboxSelected,
                        ]}
                        onPress={() => handleStatusSelect('Dinero')}
                    >
                        <View style={styles.checkboxContent}>
                            <View style={styles.iconLeft}>
                                <View style={[
                                    styles.iconContainer,
                                    // selectedStatus === 'parcial' && styles.iconContainerSelected
                                ]}>
                                    <View style={styles.checkboxRight}>
                                        <View style={styles.checkbox}>
                                            {selectedStatus === 'Dinero' && <View style={styles.checkboxInner} />}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.textContent}>
                                <Text style={styles.checkboxLabel}>Dinero insuficiente</Text>
                            </View>

                        </View>
                    </TouchableOpacity>


                    {/* Dueño no contesta */}
                    <TouchableOpacity
                        style={[
                            styles.checkboxContainer,
                            selectedStatus === 'Dueño' && styles.checkboxSelected,
                        ]}
                        onPress={() => handleStatusSelect('Dueño')}
                    >
                        <View style={styles.checkboxContent}>
                            <View style={styles.iconLeft}>
                                <View style={[
                                    styles.iconContainer,
                                    // selectedStatus === 'parcial' && styles.iconContainerSelected
                                ]}>
                                    <View style={styles.checkboxRight}>
                                        <View style={styles.checkbox}>
                                            {selectedStatus === 'Dueño' && <View style={styles.checkboxInner} />}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.textContent}>
                                <Text style={styles.checkboxLabel}>Dueño no contesta</Text>
                            </View>

                        </View>
                    </TouchableOpacity>



                    {/* Opción Tienda cerrada */}
                    <TouchableOpacity
                        style={[
                            styles.checkboxContainer,
                            selectedStatus === 'Tienda' && styles.checkboxSelected,
                        ]}
                        onPress={() => handleStatusSelect('Tienda')}
                    >
                        {selectedStatus === 'Tienda' && (
                            <View style={styles.evidenceBox}>
                                <Ionicons name="alert-circle" size={14} color="#4F74C4" />
                                <Text style={styles.evidenceText}>Este motivo requiere de carga de evidencia</Text>
                            </View>
                        )}
                        <View style={styles.checkboxContent}>
                            <View style={styles.iconLeft}>
                                <View style={styles.iconContainer}>
                                    <View style={styles.checkboxRight}>
                                        <View style={styles.checkbox}>
                                            {selectedStatus === 'Tienda' && <View style={styles.checkboxInner} />}
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.textContent}>
                                <Text style={styles.checkboxLabel}>Tienda cerrada</Text>
                            </View>
                        </View>
                    </TouchableOpacity>


                    {/* Productos dañados */}
                    <TouchableOpacity
                        style={[
                            styles.checkboxContainer,
                            selectedStatus === 'Productos' && styles.checkboxSelected,
                        ]}
                        onPress={() => handleStatusSelect('Productos')}
                    >
                        <View style={styles.checkboxContent}>
                            <View style={styles.iconLeft}>
                                <View style={[
                                    styles.iconContainer,
                                    // selectedStatus === 'parcial' && styles.iconContainerSelected
                                ]}>
                                    <View style={styles.checkboxRight}>
                                        <View style={styles.checkbox}>
                                            {selectedStatus === 'Productos' && <View style={styles.checkboxInner} />}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.textContent}>
                                <Text style={styles.checkboxLabel}>Productos dañados</Text>
                            </View>

                        </View>
                    </TouchableOpacity>

                    <PrimaryButton
                        title="Continuar"
                        onPress={handleSubmit}
                        disabled={false}
                        height={43}
                    />
                </ScrollView>
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
        zIndex: 9999,
    },
    backgroundOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
        position: "relative",
        padding: 16,
        marginBottom: 0,
        zIndex: 10000,
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
        width: 24,
        height: 24,
        alignItems: "center",
        zIndex: 10001,
    },
    closeText: {
        color: "#788095",
        fontSize: 24, // Aumenté el tamaño
        fontWeight: "300",
    },
    titleContainer: {
        marginBottom: 20,
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 18,
        fontWeight: "800",
        color: "#141D32",
        textAlign: "left",
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        gap: 12,
        paddingVertical: 8,
    },
    checkboxContainer: {
        width: '100%', // Cambié de 350 a 100%
        minHeight: 56,
        backgroundColor: '#FFFFFF',
        borderColor: '#F0F1F5',
        borderWidth: 1,
        borderRadius: 8,
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
    },
    checkboxSelected: {
        borderColor: '#164194',
    },
    checkboxContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconLeft: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F1F5',
    },
    iconSelected: {
        tintColor: '#FFFFFF',
    },
    textContent: {
        flex: 1,
        marginRight: 12,
    },
    checkboxRight: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#164194',
        borderRadius: 6,
    },
    checkboxLabel: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#141D32',
    },
    subTitle: {
        fontFamily: "Rubik",
        fontWeight: "400",
        fontSize: 14,
        marginTop: 8,
        color: "#4B5363",
    },
    evidenceBox: {
        width: '100%',
        height: 24,
        backgroundColor: "#E8EEF9",
        borderRadius: 40,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        marginBottom: 8,
        gap: 4,
    },
    evidenceText: {
        color: "#4F74C4",
        fontFamily: "Rubik",
        fontWeight: "600",
        fontSize: 12,
        lineHeight: 12,
    },
});