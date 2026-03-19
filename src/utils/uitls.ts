import { Dimensions } from "react-native";
import { TypeCaculateValueEnum } from "../constants/GuideStates";
import { Detail, Document, Novelty } from "../features/tracking/domain/details/DetailsGuide";

export function cleanSpaces(text: string = "") {
    return text.replace(/\s+/g, " ").trim();
}

export function getDeviceDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatTime(dateStr: string): string {
    const d = new Date(dateStr);

    // Día / Mes / Año (2 dígitos)
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear().toString().slice(-2); // 2025 → 25

    // Hora
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `Inicio ruta ${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

export const getMimeType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        case 'heic':
        case 'heif':
            return 'image/heic';
        case 'bmp':
            return 'image/bmp';
        default:
            return 'image/jpeg'; // Valor por defecto
    }
};

export const createDataUri = (base64: string, uri: string): string => {
    if (base64.startsWith("data:")) {
        return base64;
    }
    const mimeType = getMimeType(uri);
    return `data:${mimeType};base64,${base64}`;
};

export function formatNumber(num: number | undefined | null) {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString("es-CO");
}

export function formatStringToNumber(value: string) {
    const cleanValue = value.replace(/[^\d]/g, '');
    const number = Number(cleanValue);
    return isNaN(number) ? 0 : number;
}


export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radio de la Tierra en metros
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function capitalizeFirst(text?: string) {
    return text
        ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        : "";
}


export function heightCaldulate(heightValue = 853.3333333333334) {
    const { width, height } = Dimensions.get('window');
    return height < heightValue;
}

export function toUpperCase(text?: string) {
    return text ? text.toUpperCase() : '';
}

export function calculateVlueByPorducts(data: Detail, action: string, unitRefusedValue?: number, novelty?: Novelty[], porcentajeDFR?: number): number {
    const baseValue = Number(data?.valorBaseProducto ?? 0);
    const totalTaxes = Number(data?.totalImpuestos ?? 0);
    const unit = Number(data?.unidadesSolicitadas ?? 0);
    const unitRefused = Number(data?.unidadesRechazadas ?? 0);
    const unitEntry = Number(data?.unidadesEntregadas ?? 0);
    const form_1 = (totalTaxes / unit) + baseValue
    let valueUnit = 0;

    switch (action) {
        case TypeCaculateValueEnum.ACTION_1:
            return (form_1 * unit);

        case TypeCaculateValueEnum.ACTION_2:
            return form_1;

        case TypeCaculateValueEnum.ACTION_3:
            let valueImpuestoTwo = 0;
            const porcentajeDFRValueTwo = Number(porcentajeDFR || 0) / 100;
            
            const valueCalculatedImpuestoTwo = Number(totalTaxes) / Number(unit || 0);
            valueImpuestoTwo = valueCalculatedImpuestoTwo * Number(unitRefused || 0);

            const totalValueNetoTwo = Number(baseValue || 0) * Number(unitRefused || 0);
            const valueCalcualtedLineTwo = totalValueNetoTwo * porcentajeDFRValueTwo;
            return (totalValueNetoTwo + valueImpuestoTwo) - valueCalcualtedLineTwo;


        case TypeCaculateValueEnum.ACTION_4:
            return totalTaxes / unit;

        case TypeCaculateValueEnum.ACTION_5:
            let valueImpuesto = 0;
            const porcentajeDFRValue = Number(porcentajeDFR || 0) / 100;

            const valueCalculatedImpuesto = Number(totalTaxes) / Number(unit || 0);
            valueImpuesto = valueCalculatedImpuesto * Number(unitRefusedValue ? unitRefusedValue : unitEntry || 0);

            const totalValueNeto = Number(baseValue || 0) * Number(unitRefusedValue ? unitRefusedValue : unitEntry || 0);
            const valueCalcualtedLine = totalValueNeto * porcentajeDFRValue;
            return ((totalValueNeto + valueImpuesto) - valueCalcualtedLine);


            
        case TypeCaculateValueEnum.ACTION_6:
            return unitRefusedValue ? unitRefusedValue : unit;

        case TypeCaculateValueEnum.ACTION_7:
            return unitRefusedValue ? (totalTaxes / unitRefusedValue ? unitRefusedValue : unit) : 0;

        case TypeCaculateValueEnum.ACTION_8:
            let totalNovelty = 0;
            if (novelty && Array.isArray(novelty)) {
                totalNovelty = novelty.reduce((totalSum, doc: Novelty) => {
                    const valor = parseFloat(doc.valor) || 0;
                    return totalSum + valor;
                }, 0)
            }
            return totalNovelty > 0 ? (form_1 * totalNovelty) : (form_1 * unit);

        case TypeCaculateValueEnum.ACTION_9:
            return (form_1 * unitEntry);
        default:
            return 0;
    }

}

export function calculateValuesDFRArray(data: Document[]) {
    let totalGeneral = 0;

    data?.forEach((pedido) => {

        const porcentajeDFR = Number(pedido?.porcentajeDFR || 0) / 100;
        pedido?.detalles?.forEach((detalle) => {

            let valueImpuesto = 0;

            const valueCalculatedImpuesto = Number(detalle?.totalImpuestos) / Number(detalle?.unidadesSolicitadas || 1);
            valueImpuesto = valueCalculatedImpuesto * Number(detalle?.unidadesEntregadas || 0);

            const totalValueNeto = Number(detalle?.valorBaseProducto || 0) * Number(detalle?.unidadesEntregadas || 0);
            const valueCalcualtedLine = totalValueNeto * porcentajeDFR;

            const sumTotalOrder = (totalValueNeto + valueImpuesto) - valueCalcualtedLine;

            totalGeneral += sumTotalOrder;

     
        });
    });

    return totalGeneral;
}

export function capitalizeWords(text?: string) {
    if (!text) return "";

    return text
        .toLowerCase()
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

interface HasUnidadesEntregadas {
    unidadesEntregadas?: number;
}
export function calculateNewValues<T, U extends HasUnidadesEntregadas & Detail>(
    oldData: T[] = [],
    newData: U[] = [],
    pendingData: U[] = []

): {
    valueRealTotal: number;
    valueCalculateTotal: number;

    // 200 inicial  
    // 100 rechazo 
    // 100 - inicial 
} {
    try {
        let valueRealTotal = 0;
        let valueCalculateTotal = 0;

        // Procesar datos antiguos
        for (let i = 0; i < oldData.length; i++) {
            const item = oldData[i];
            const obj = item as any;


            // Validar que detalles exista y sea un array
            if (!Array.isArray(obj?.detalles)) {
                // console.log('Item sin detalles válidos');
                continue;
            }

            // console.log(`Detalles encontrados: ${obj.detalles.length}`);

            for (let e = 0; e < obj.detalles.length; e++) {
                const detail = obj.detalles[e];



                valueRealTotal += calculateVlueByPorducts(
                    detail,
                    TypeCaculateValueEnum.ACTION_1
                );
                // console.log('→ valueRealTotal:', valueRealTotal);
            }
        }

        // Procesar datos nuevos
        for (let a = 0; a < newData.length; a++) {
            const newItem = newData[a];

            if (newItem?.unidadesEntregadas > 0) {
                valueCalculateTotal += calculateVlueByPorducts(
                    newItem as Detail,
                    TypeCaculateValueEnum.ACTION_9
                );
            }

        }
        console.log("valueRealTotal: ", valueRealTotal);
        console.log("valueCalculateTotal: ", valueCalculateTotal);

        return {
            valueRealTotal,
            valueCalculateTotal
        };
    } catch (error) {
        return {
            valueRealTotal: 0,
            valueCalculateTotal: 0
        };
    }
}

export function formatTimeByMinutes(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const uriToBase64 = async (uri: string): Promise<string> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                resolve(reader.result as string);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Error convirtiendo URI a base64:", error);
        throw error;
    }
};

