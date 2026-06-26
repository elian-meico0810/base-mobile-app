import { ThemedText } from '@/components/themed-text';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

export const LogoText = ({ style }: { style?: any }) => {
  const { width: windowWidth } = useWindowDimensions();
  
  // Detectar si es tablet
  const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
  
  // Detectar si es pantalla muy pequeña
  const isSmallScreen = windowWidth < 360;
  
  // Tamaños responsivos
  const getLogoSize = () => {
    if (isTablet) {
      return { width: 200, height: 40, fontSize: 32 };
    } else if (isSmallScreen) {
      return { width: 120, height: 24, fontSize: 20 };
    } else {
      return { width: 158, height: 32, fontSize: 26 };
    }
  };
  
  const logoSize = getLogoSize();

  return (
    <View style={[styles.container, style]}>
      <ThemedText 
        type="title" 
        style={[
          styles.meico,
          { 
            width: logoSize.width,
            height: logoSize.height,
            fontSize: logoSize.fontSize,
            lineHeight: logoSize.height,
          }
        ]}
      >
        MeiTruck
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  meico: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Rubik',
    fontWeight: '700',
  },
});