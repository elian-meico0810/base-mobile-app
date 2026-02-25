import { EvidencePhoto, GuideDetails, ResponseOTPInitPorps } from '@/src/features/tracking/domain/details/DetailsGuide';
import { ProductForm } from '@/src/ui/detailsInvoice/counter-delivery/indexInvoice/products/ProductForm';
import { ViewFileFormOTP } from '@/src/ui/detailsInvoice/counter-delivery/indexInvoice/products/ViewFileFormOTP';
import { ViewOTPCodeForm } from '@/src/ui/detailsInvoice/counter-delivery/indexInvoice/products/ViewOTPCodeForm';
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
    const totalOrderPayment = params.totalOrderPayment ? Number(params.totalOrderPayment) : 0;
    const expireDate = params.expireDate as string;
    const validateConditionRender =
        Number.isFinite(Number(totalRecauder)) && Number.isFinite(Number(totalOrderPayment))
    Number.isFinite(Number(totalValue));
    const isFileView = params.isFileView as string;
    const sasToken = params.sasToken as string;
    const data = params.multiplePhotos as string;
    const multiplePhotos: EvidencePhoto[] = data ? JSON.parse(data) : [];



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
                if (!confirmationStatus && !isFileView) {

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

                if (confirmationStatus && responseOTPInit && validateConditionRender || expireDate) {
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
                            totalOrderPayment={totalOrderPayment}
                            expireDate={expireDate ? true : false}
                        />
                    );
                }

                if (isFileView) {
                    return (
                        <ViewFileFormOTP
                            onPermisionsPhoto={() => { }}
                            multiplePhotos={multiplePhotos}
                            sasToken={sasToken}
                            initialGuide={guideObj}
                            token={token || ""}
                            numberGuide={Number(numberGuide)}

                        />
                    );
                }
            })()}

        </>
    );
}
