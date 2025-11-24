import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { InfoInvoiceForm } from '@/src/ui/tracking/details/InfoInvoiceForm';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function IndexInvoiceScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Informacion pedidos',
                    headerShown: false
                }}
            />
            <InfoInvoiceForm
                initialGuide={guideObj}
                token={token || ""}
                onSubmit={async ({ guide, token }) => { }}
            />
        </>
    );
}
