import { Consignment } from '@/src/features/tracking/domain/consignments/Consignment';
import { Ionicons } from '@expo/vector-icons';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface ConsignmentOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    consignment: Consignment | null;
    onEdit?: (consignment: Consignment) => void;
    onViewReceipt?: (consignment: Consignment) => void;
    onDelete?: (consignment: Consignment) => void;
}

export function ConsignmentOptionsModal({
    visible,
    onClose,
    consignment,
    onEdit,
    onViewReceipt,
    onDelete
}: ConsignmentOptionsModalProps) {
    if (!consignment) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.fullScreenOverlay}
                onPress={onClose}
                activeOpacity={1}
            />

            <View style={styles.modalWrapper}>
                <View style={[styles.container, { width }]}>
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Consignación #{consignment.id}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#788095" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <TouchableOpacity 
                            style={styles.optionRow} 
                            onPress={() => {
                                onClose();
                                onEdit?.(consignment);
                            }}
                        >
                            <View style={styles.optionLeft}>
                                <View style={styles.iconContainer}>
                                    <Image 
                                        source={require('@/assets/icons/EditIcon.png')} 
                                        style={styles.iconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.optionText}>Editar</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#141D32" />
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        <TouchableOpacity 
                            style={styles.optionRow}
                            onPress={() => {
                                onClose();
                                onViewReceipt?.(consignment);
                            }}
                        >
                            <View style={styles.optionLeft}>
                                <View style={styles.iconContainer}>
                                    <Image 
                                        source={require('@/assets/icons/ViewImageIcon.png')} 
                                        style={styles.iconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.optionText}>Ver comprobante</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#141D32" />
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        <TouchableOpacity 
                            style={styles.optionRow}
                            onPress={() => {
                                onClose();
                                onDelete?.(consignment);
                            }}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.iconContainer, styles.deleteIconContainer]}>
                                    <Image 
                                        source={require('@/assets/icons/DeleteIcon.png')} 
                                        style={[styles.iconImage, { tintColor: '#D32F2F' }]}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={[styles.optionText, styles.deleteText]}>Eliminar</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fullScreenOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    container: {
        backgroundColor: "#F9F9FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 55,
    },
    dragHandle: {
        alignSelf: "center",
        width: 40,
        height: 4,
        backgroundColor: "#E6E8EC",
        borderRadius: 2,
        marginTop: 8,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    title: {
        fontFamily: "Rubik",
        fontSize: 20,
        fontWeight: "700",
        color: "#141D32",
    },
    closeButton: {
        padding: 4,
    },
    content: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 12
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F1F5',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: '#F9F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deleteIconContainer: {
        backgroundColor: '#FFEBEE',
    },
    optionText: {
        fontFamily: "Rubik",
        fontSize: 14,
        fontWeight: "400",
        color: "#141D32",
    },
    deleteText: {
        color: "#D32F2F",
    },
    separator: {
        display: 'none',
    },
    iconImage: {
        width: 20,
        height: 20,
    }
});
