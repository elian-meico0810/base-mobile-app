import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { InfoInvoiceForm } from '@/src/ui/tracking/invoices/InfoInvoiceForm';
import { ViewSelectInvoice } from '@/src/ui/tracking/invoices/ViewSelectInvoice';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function IndexInvoiceScreen() {
    const data: GuideDetails[] = [
        {
            codigoCliente: "000000041132",
            direccion: "CR 8A # 62B - 62",
            estado: "Pendiente",
            facturas: [
                {
                    condPago: "TAT",
                    dfr: 0,
                    numeroFactura: "16004944",
                    tipo: "CONTADO EFECTIVO",
                    valorRecaudar: 44958.48,
                    valorTotal: 44958.48
                },
                {
                    condPago: "TAT",
                    dfr: 0,
                    numeroFactura: "16004944",
                    tipo: "CONTADO EFECTIVO",
                    valorRecaudar: 44958.48,
                    valorTotal: 44958.48
                },
                 {
                    condPago: "TAT",
                    dfr: 0,
                    numeroFactura: "16004944",
                    tipo: "CONTADO EFECTIVO",
                    valorRecaudar: 44958.48,
                    valorTotal: 44958.48
                },
                 {
                    condPago: "TAT",
                    dfr: 0,
                    numeroFactura: "16004944",
                    tipo: "CONTADO EFECTIVO",
                    valorRecaudar: 44958.48,
                    valorTotal: 44958.48
                },
                 {
                    condPago: "TAT",
                    dfr: 0,
                    numeroFactura: "16004944",
                    tipo: "CONTADO EFECTIVO",
                    valorRecaudar: 44958.48,
                    valorTotal: 44958.48
                }
            ],
            idDireccion: 27,
            latitud: "",
            longitud: "",
            nombreCliente: "ECOIKOS E.A.T.",
            poblacion: "MONTERIA-COR. 1410 ACTI"
        }
    ];


    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const numberGuide = params.numberGuide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;
    const guides: GuideDetails[] = data as GuideDetails[];
    const count = data[0].facturas.length;

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Informacion pedidos',
                    headerShown: false
                }}
            />
            {count >= 2 ? (
                <ViewSelectInvoice
                    initialGuide={guides[0]}
                    token={token || ""}
                    onSubmit={async ({ guide, token }) => { }}
                    numberGuide={Number(numberGuide)}
                />
            ) : (
                <InfoInvoiceForm
                    initialGuide={guideObj}
                    token={token || ""}
                    onSubmit={async ({ guide, token }) => { }}
                    numberGuide={Number(numberGuide)}
                />
            )}


        </>
    );
}
