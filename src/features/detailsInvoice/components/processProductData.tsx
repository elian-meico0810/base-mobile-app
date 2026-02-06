// Definición de tipos
interface ProductItem {
  id: number;
  tatolValue: number;
  // otras propiedades que pueda tener item
}

interface ProductItemProps {
  item: ProductItem;
  isLastItem: boolean;
  onValidate: () => void;
  validationType: string;
  idValue?: number[];
  tatolValue?: number[];
}

// Array para almacenar los datos
let dataArray: Array<{id: number, tatolValue: number}> = [];

// Función para procesar y actualizar el array
export const processProductData = (
  idValue: number[], 
  tatolValue: number[], 
  item: ProductItem
): Array<{id: number, tatolValue: number}> => {
  
  // Validar que los arrays tengan la misma longitud
  if (idValue.length !== tatolValue.length) {
    return dataArray;
  }

  // Procesar cada elemento de los arrays
  idValue.forEach((id, index) => {
    const value = tatolValue[index];
    
    // Buscar si el id ya existe en dataArray
    const existingIndex = dataArray.findIndex(element => element.id === id);
    
    if (existingIndex !== -1) {
      // Si existe, actualizar el valor (reemplazar el viejo con el nuevo)
      console.log(`Actualizando id ${id}: viejo valor ${dataArray[existingIndex].tatolValue}, nuevo valor ${value}`);
      dataArray[existingIndex].tatolValue = value;
    } else {
      // Si no existe, agregar nuevo elemento
      console.log(`Agregando nuevo id ${id} con valor ${value}`);
      dataArray.push({
        id: id,
        tatolValue: value
      });
    }
  });

  // Si el item tiene id y tatolValue, procesarlo también
  if (item && item.id && item.tatolValue !== undefined) {
    const existingIndex = dataArray.findIndex(element => element.id === item.id);
    
    if (existingIndex !== -1) {
      dataArray[existingIndex].tatolValue = item.tatolValue;
    } else {
      dataArray.push({
        id: item.id,
        tatolValue: item.tatolValue
      });
    }
  }

  return dataArray;
};
