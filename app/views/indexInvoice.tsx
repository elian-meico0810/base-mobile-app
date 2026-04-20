import { TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { GuideDetails, PaymentsByInvoice } from '@/src/features/tracking/domain/details/DetailsGuide';
import { ViewSelectAllAnticipe } from '@/src/ui/tracking/invoices/anticipe-and-count/ViewSelectAllAnticipe';
import { ViewSelectInvoice as AnticipateAndCountViewSelectInvoice } from '@/src/ui/tracking/invoices/anticipe-and-count/ViewSelectInvoice';
import { InfoInvoiceForm } from '@/src/ui/tracking/invoices/counter-delivery/InfoInvoiceForm';
import { ViewSelectInvoice } from '@/src/ui/tracking/invoices/counter-delivery/ViewSelectInvoice';
import { InfoInvoiceCreditForm } from '@/src/ui/tracking/invoices/credit/InfoInvoiceCreditForm';
import { ViewSelectInvoice as CreditViewSelectInvoice } from '@/src/ui/tracking/invoices/credit/ViewSelectInvoice';
import { ViewDefault } from '@/src/ui/tracking/view-default/ViewDefaulTForm';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function IndexInvoiceScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const paymentByGuideParam = params.paymentByGuide as string;
    const numberGuide = params.numberGuide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;
    const paymentByGuide: PaymentsByInvoice = paymentByGuideParam ? JSON.parse(paymentByGuideParam) : {} as PaymentsByInvoice;
    const isSelectInvocies = params.isSelectInvocies as string;
    const routeStartedBotton = params.routeStarted as string;
    const documentMeico = params.documentMeico as string;
    const detailsCounterDelivery = params.detailsCounterDelivery as string;
    const shouldShowViewSelectInvoice = guideObj.facturas.length >= 2 || documentMeico;
    const areAllInvoicesCredito = guideObj.facturas.every(
        factura => factura.tipo === TypeInvoiceEnum.CREDITO
    );
    const areAllInvoicesAnticipeOne = guideObj.facturas.every(
        factura => factura.tipo === TypeInvoiceEnum.ANTICIPO
    );

    const areAllInvoicesConutreDlivery = guideObj.facturas.every(
        factura => factura.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO || factura.tipo === TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO ||
            factura.tipo === TypeInvoiceEnum.MIXTO
    );
    const areAllInvoicesAnticipe = guideObj.facturas.every(
        factura => factura.tipo === TypeInvoiceEnum.ANTICIPO || factura.tipo === TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO || factura.tipo === TypeInvoiceEnum.CONTADO_EFECTIVO
    );
    const areAllInvoicesSameStatus =
        guideObj.facturas.length > 0 &&
        guideObj.facturas.every(
            factura => factura.tipo === guideObj.facturas[0].tipo
        );

    const isCountryDelivery = params.isCountryDelivery as string;
    const IsGoBack = params.IsGoBack as string;
    const isViewDetailsPorducts = params.isViewDetailsPorducts as string;
    const isAnticipe = params.isAnticipe as string;
    const isAnticipeInvoice = params.isAnticipeInvoice as string;
    const selectedOption = params.selectedOption as string;
    const notDetails = params.notDetails as string;

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Informacion pedidos',
                    headerShown: false
                }}
            />

            {/* Mas de una facuta y tiene que ser CONTADO_EFECTIVO */}
            {(() => {
                // Condición 1
                if (shouldShowViewSelectInvoice && areAllInvoicesConutreDlivery && !isAnticipe) {
                    return (
                        <ViewSelectInvoice
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
                // Condición 2
                if ((areAllInvoicesConutreDlivery && guideObj.facturas.length < 2 || isCountryDelivery) && !isAnticipeInvoice) {
                    return (
                        <InfoInvoiceForm
                            initialGuide={guideObj}
                            token={token || ""}
                            onSubmit={async ({ guide, token }) => { }}
                            numberGuide={Number(numberGuide)}
                            isSelectInvocies={isSelectInvocies}
                            documentMeico={documentMeico}
                            isCountryDelivery={isCountryDelivery ? true : false}
                            IsGoBack={IsGoBack ? true : false}
                            routeStartedBotton={routeStartedBotton}
                            detailsCounterDelivery={detailsCounterDelivery ? true : false}
                            isViewDetailsPorducts={isViewDetailsPorducts ? true : false}
                            isAnticipe={isAnticipe}

                        />
                    );
                }

                // Condición 3
                if ((areAllInvoicesAnticipeOne || areAllInvoicesCredito) && guideObj.facturas.length < 2) {
                    return (
                        <InfoInvoiceCreditForm
                            initialGuide={guideObj}
                            token={token || ""}
                            onSubmit={async ({ guide, token }) => { }}
                            numberGuide={Number(numberGuide)}
                            isSelectInvocies={isSelectInvocies}
                            documentMeico={documentMeico}
                            selectedOption={selectedOption}
                            notDetails={notDetails}
                            detailsCounterDelivery={detailsCounterDelivery ? true : false}

                        />
                    );
                }

                // Condición 3
                if (areAllInvoicesCredito && guideObj.facturas.length >= 2) {
                    return (
                        <CreditViewSelectInvoice
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

                if (areAllInvoicesSameStatus && guideObj.facturas.length >= 2) {
                    return (
                        <ViewSelectAllAnticipe
                            initialGuide={guideObj}
                            token={token || ""}
                            onSubmit={async ({ guide, token }) => { }}
                            numberGuide={Number(numberGuide)}
                            isSelectInvocies={isSelectInvocies}
                            documentMeico={documentMeico}
                            routeStartedBotton={routeStartedBotton}
                        />
                    );

                } else {
                    if (areAllInvoicesAnticipe || isAnticipe) {
                        return (
                            <AnticipateAndCountViewSelectInvoice
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
                }

                return (
                    <ViewDefault
                        initialGuide={guideObj}
                        token={token || ""}
                        onSubmit={async ({ guide, token }) => { }}
                        numberGuide={Number(numberGuide)}
                        isSelectInvocies={isSelectInvocies}
                        documentMeico={documentMeico}
                    />
                );
            })()}

        </>
    );
}
