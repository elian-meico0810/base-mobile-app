import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { InfoInvoiceForm } from '@/src/ui/tracking/invoices/InfoInvoiceForm';
import { ViewSelectInvoice } from '@/src/ui/tracking/invoices/ViewSelectInvoice';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function IndexInvoiceScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const numberGuide = params.numberGuide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;
    const isSelectInvocies = params.isSelectInvocies as string;
    const documentMeico = params.documentMeico as string;

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Informacion pedidos',
                    headerShown: false
                }}
            />
            {guideObj.facturas.length >= 2 || documentMeico ? (
                <ViewSelectInvoice
                    initialGuide={guideObj}
                    token={token || ""}
                    onSubmit={async ({ guide, token }) => { }}
                    numberGuide={Number(numberGuide)}
                    isSelectInvocies={isSelectInvocies}
                    documentMeico={documentMeico}
                />
            ) : (

                <InfoInvoiceForm
                    initialGuide={guideObj}
                    token={token || ""}
                    onSubmit={async ({ guide, token }) => { }}
                    numberGuide={Number(numberGuide)}
                    isSelectInvocies={isSelectInvocies}
                    documentMeico={documentMeico}

                />
            )}


        </>
    );
}
