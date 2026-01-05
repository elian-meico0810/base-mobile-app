import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { ProductForm } from '@/src/ui/detailsInvoice/products/ProductForm';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function IndexDetailsInvoiceScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const paymentByGuideParam = params.paymentByGuide as string;
    const numberGuide = params.numberGuide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;
    const isSelectInvocies = params.isSelectInvocies as string;
    const routeStartedBotton = params.routeStarted as string;
    const documentMeico = params.documentMeico as string;
    const viewOrder = params.viewOrder as string;
    const shouldShowViewSelectInvoice = guideObj.facturas.length >= 2 || documentMeico;
    
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Detalle de factura',
                    headerShown: false
                }}
            />

            {/* listado de detalle de facturas */}
            {(() => {
                return (
                    <ProductForm
                        initialGuide={guideObj}
                        token={token || ""}
                        onSubmit={async ({ guide, token }) => { }}
                        numberGuide={Number(numberGuide)}
                        isSelectInvocies={isSelectInvocies}
                        documentMeico={documentMeico}
                        routeStartedBotton={routeStartedBotton}
                    />
                );
            })()}

        </>
    );
}
