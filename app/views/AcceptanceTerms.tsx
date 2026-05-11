import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { Order } from '@/src/features/tracking/domain/invoices/InvoicesInterFace';
import { ViewDetailsPorductsOrder } from '@/src/ui/acceptation-terminal/view-details-products-order/ViewDetailsPorductsOrder';
import { ViewAcceptationTerms } from '@/src/ui/acceptation-terminal/ViewAcceptationTerms';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function AcceptanceTermsScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const numberGuide = params.numberGuide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;
    const isSelectInvocies = params.isSelectInvocies as string;
    const routeStartedBotton = params.routeStarted as string;
    const documentMeico = params.documentMeico as string;
    const detailsCounterDelivery = params.detailsCounterDelivery as string;
    const detailsOrder = params.orderDetails as string;
    const orderParam = params.order as string;
    const OrderArray: Order = orderParam ? JSON.parse(orderParam) : {} as Order;
    const isEjecute = params.isEjecute as string;

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Aceptación de Terminos',
                    headerShown: false
                }}
            />

            {(() => {

                if (!detailsOrder) {
                    return (
                        <ViewAcceptationTerms
                            token={token || ""}
                            onSubmit={async ({ guide, token }) => { }}
                            numberGuide={Number(numberGuide)}
                            isSelectInvocies={isSelectInvocies}
                            documentMeico={documentMeico}
                            isCountryDelivery={false}
                            IsGoBack={false}
                            detailsCounterDelivery={false}
                            isEjecute={isEjecute}

                        />

                    )
                }

                if (detailsOrder) {
                    return (
                        <ViewDetailsPorductsOrder
                            token={token || ""}
                            onSubmit={async ({ guide, token }) => { }}
                            numberGuide={Number(numberGuide)}
                            isSelectInvocies={isSelectInvocies}
                            documentMeico={documentMeico}
                            isCountryDelivery={false}
                            IsGoBack={false}
                            detailsCounterDelivery={false}
                            detailsOrder={detailsOrder}
                            OrderArray={OrderArray}

                        />
                    )
                }
            })()}
        </>
    );
}
