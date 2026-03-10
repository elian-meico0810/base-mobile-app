import { GuideDetails } from '@/src/features/tracking/domain/details/DetailsGuide';
import { VewAcceptationTerms } from '@/src/ui/acceptation-terminal/VewAcceptationTerms';
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
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Aceptación de Terminos',
                    headerShown: false
                }}
            />
            <VewAcceptationTerms
                token={token || ""}
                onSubmit={async ({ guide, token }) => { }}
                numberGuide={Number(numberGuide)}
                isSelectInvocies={isSelectInvocies}
                documentMeico={documentMeico}
                isCountryDelivery={false}
                IsGoBack={false}
                detailsCounterDelivery={ false}

            />
        </>
    );
}
