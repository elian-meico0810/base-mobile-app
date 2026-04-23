import { LoadingBlue } from '@/components/generals/LoadingBlue';
import { TypeInvoiceEnum } from '@/src/constants/GuideStates';
import { GuideDetails, Modulo, ModuloVista, PaymentsByInvoice } from '@/src/features/tracking/domain/details/DetailsGuide';
import { InfoInvoiceForm } from '@/src/ui/tracking/invoices/counter-delivery/InfoInvoiceForm';
import { ViewSelectInvoice } from '@/src/ui/tracking/invoices/counter-delivery/ViewSelectInvoice';
import { InfoInvoiceCreditForm } from '@/src/ui/tracking/invoices/credit/InfoInvoiceCreditForm';
import { ViewDefault } from '@/src/ui/tracking/view-default/ViewDefaulTForm';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export default function IndexInvoiceScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;
    const guideParam = params.guide as string;
    const guideObj: GuideDetails = guideParam ? JSON.parse(guideParam) : {} as GuideDetails;

    const [menuViewsParsed, setMenuViewsParsed] = useState<ModuloVista[]>([]);
    const [menuFatherParsed, setMenuFatherParsed] = useState<Modulo[]>([]);
    const [isLoadingMenus, setIsLoadingMenus] = useState(true);


    const validateInvoicesByModule = (moduleName: string) => {
        return guideObj.facturas.every(factura =>
            menuViewsParsed.some((mv: any) =>
                mv.nombre === factura.tipo &&
                mv.modulo?.nombre === moduleName
            )
        );
    };

    useEffect(() => {
        const loadMenus = async () => {
            try {
                const menu_views = await SecureStore.getItemAsync('menu_views');
                const menu_father = await SecureStore.getItemAsync('menu_father');
               
                setMenuViewsParsed(JSON.parse(menu_views || "[]"));
                setMenuFatherParsed(JSON.parse(menu_father || "[]"));
            } catch (error) {
                console.log("Error cargando menús:", error);
            } finally {
                setIsLoadingMenus(false);
            }
        };

        loadMenus();
    }, []);

    const paymentByGuideParam = params.paymentByGuide as string;
    const numberGuide = params.numberGuide as string;
    const paymentByGuide: PaymentsByInvoice = paymentByGuideParam ? JSON.parse(paymentByGuideParam) : {} as PaymentsByInvoice;
    const isSelectInvocies = params.isSelectInvocies as string;
    const routeStartedBotton = params.routeStarted as string;
    const documentMeico = params.documentMeico as string;
    const detailsCounterDelivery = params.detailsCounterDelivery as string;
    const shouldShowViewSelectInvoice = guideObj.facturas.length >= 2 || documentMeico;
    const areAllInvoicesCredito = validateInvoicesByModule(TypeInvoiceEnum.CREDITO);
    const areAllInvoicesAnticipeOne = validateInvoicesByModule(TypeInvoiceEnum.ANTICIPO);

    const areAllInvoicesConutreDlivery =
        guideObj.facturas.every(factura =>
            menuViewsParsed.some((mv: any) =>
                mv.nombre === factura.tipo &&
                [
                    TypeInvoiceEnum.CONTADO_EFECTIVO,
                    TypeInvoiceEnum.PAGOS_APLICATIVO_MEICO,
                    // TypeInvoiceEnum.MIXTO
                ].includes(mv.modulo?.nombre)
            )
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
    const notEntry = params.notEntry as string;
    
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
                if (shouldShowViewSelectInvoice && !isAnticipe) {
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
                            notEntry={notEntry}
                            isViewDetailsPorducts={isViewDetailsPorducts ? true : false}
                        />
                    );
                }

                if (menuViewsParsed.length === 0) {
                    return (
                        <LoadingBlue />
                    );
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
