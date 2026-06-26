import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";

interface SearchInputProps<T> {
  data: T[]; 
  onSearch: (filteredData: T[]) => void; 
  placeholder?: string;
  keyExtractor?: (item: T) => string; 
}

export function SearchInput<T>({
  data,
  onSearch,
  placeholder,
  keyExtractor = (item: any) => item.toString(),
}: SearchInputProps<T>) {
  const [searchText, setSearchText] = useState("");
  const { width: windowWidth } = useWindowDimensions();
  
  // Same responsive logic from GuideCardSkeleton
  const isTablet = windowWidth >= 768 || (Platform.OS === 'android' && windowWidth >= 600) || (Platform.OS === 'ios' && windowWidth >= 768);
  
  // Get window width for responsive sizing
  const { width } = Dimensions.get("window");
  
  // Calculate responsive width based on device
  const searchWidth = isTablet ? '100%' : width * 0.9;

  useEffect(() => {
    const filtered = data.filter(item =>
      keyExtractor(item).toLowerCase().includes(searchText.toLowerCase())
    );
    onSearch(filtered);
  }, [searchText, data]);

  return (
    <View style={[styles.container, { width: searchWidth }]}>
      <Ionicons name="search-outline" size={isTablet ? 22 : 18} color="#AAAAAA" style={styles.icon} />
      <TextInput
        style={[styles.input, isTablet && styles.inputTablet]}
        value={searchText}
        onChangeText={setSearchText}
        placeholder={placeholder || "Buscar..."}
        placeholderTextColor="#AAAAAA"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 41,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F1F5",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",     
    alignItems: "center",
    paddingHorizontal: 12,
    alignSelf: "center", // Added to center the component
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
  },
  inputTablet: {
    fontSize: 16,
    height: 50,
  },
});