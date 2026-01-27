import { GuideDetails, ResponseOTPInitPorps } from '@/src/features/tracking/domain/details/DetailsGuide';
import { ProductForm } from '@/src/ui/detailsInvoice/products/ProductForm';
import { ViewOTPCodeForm } from '@/src/ui/detailsInvoice/products/ViewOTPCodeForm';
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
    const confirmationStatus = params.confirmationStatus as string;
    const responseOTPInitParam = params.responseOTPInit as string;
    const responseOTPInit: ResponseOTPInitPorps = responseOTPInitParam ? JSON.parse(responseOTPInitParam) : null;
    const totalRecauder = params.totalRecauder ? Number(params.totalRecauder) : 0;
    const totalValue = params.totalValue ? Number(params.totalValue) : 0;
    
    const validateConditionRender =
        Number.isFinite(Number(totalRecauder)) &&
        Number.isFinite(Number(totalValue));

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
                if (!confirmationStatus) {

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
                }

                if (confirmationStatus && responseOTPInit && validateConditionRender) {
                    return (
                        <ViewOTPCodeForm
                            initialGuide={guideObj}
                            token={token || ""}
                            onSubmit={async ({ guide, token }) => { }}
                            numberGuide={Number(numberGuide)}
                            isSelectInvocies={isSelectInvocies}
                            documentMeico={documentMeico}
                            routeStartedBotton={routeStartedBotton}
                            responseOTPInit={responseOTPInit}
                            totalRecauder={totalRecauder}
                            totalValue={totalValue}
                        />
                    );
                }
            })()}

        </>
    );
}
