import * as Linking from "expo-linking";

export function openGoogleMaps(lat?: number, lng?: number, address?: string) {
    if (lat && lng) {
        Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
        return;
    }

    if (address) {
        const q = encodeURIComponent(address);
        Linking.openURL(`https://www.google.com/maps?q=${q}`);
    }
}

export function openWaze(lat?: number, lng?: number, address?: string) {
    if (lat && lng) {
        Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
        return;
    }

    if (address) {
        const q = encodeURIComponent(address);
        Linking.openURL(`https://waze.com/ul?q=${q}&navigate=yes`);
    }
}

export function openNativeMapIntent(lat?: number, lng?: number, address?: string) {

    let url = "";

    if (lat && lng) {
        url = `geo:${lat},${lng}?q=${lat},${lng}`;
    } else if (address) {
        const q = encodeURIComponent(address);
        url = `geo:0,0?q=${q}`;
    }

    Linking.openURL(url);
}

export function openChooser(lat?: number, lng?: number, address?: string) {

    const validCoords =
        lat !== undefined &&
        lng !== undefined &&
        lat !== 0 &&
        lng !== 0 &&
        !isNaN(lat) &&
        !isNaN(lng);

    let uri = "";
    
    if (!validCoords) {
        return;
    }

    if (validCoords) {
        uri = `geo:${lat},${lng}?q=${lat},${lng}`;
    } else if (address) {
        const encoded = encodeURIComponent(address);
        uri = `geo:0,0?q=${encoded}`;
    } else {
        return;
    }

    Linking.openURL(uri);
}


/**
 * Abre chooser de mapas con origen y destino opcional
 */
// export function openChooser(
//   lat1?: number,
//   lng1?: number,
//   lat2?: number,
//   lng2?: number
// ) {
//   const hasCoords =
//     lat1 !== undefined &&
//     lng1 !== undefined &&
//     !isNaN(lat1) &&
//     !isNaN(lng1);

//   if (!hasCoords) {
//     Alert.alert('Ubicación inválida', 'No se pudo determinar el punto de inicio.');
//     return;
//   }

//   let uri = '';

//   if (lat2 !== undefined && lng2 !== undefined && !isNaN(lat2) && !isNaN(lng2)) {
//     // Origen y destino
//     if (Platform.OS === 'android') {
//       // Esto abre el chooser en Android
//       uri = `geo:${lat1},${lng1}?q=${lat2},${lng2}`;
//     } else {
//       // iOS Apple Maps
//       uri = `http://maps.apple.com/?saddr=${lat1},${lng1}&daddr=${lat2},${lng2}`;
//     }
//   } else {
//     // Solo origen (marcador)
//     uri = `geo:${lat1},${lng1}?q=${lat1},${lng1}`;
//   }

//   Linking.openURL(uri).catch(() => {
//     Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
//   });
// }
