import { DetailsForm } from '@/src/ui/tracking/details/DetailsForm';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function DetailsScreen() {
    const params = useLocalSearchParams();
    const token = params.token as string;      
    const receivedGuide = params.guide as string;
    const showAlert = params.showAlert as string;

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Detalles de Guía',
                    headerShown: false
                }}
            />
            
            <DetailsForm
                initialGuide={receivedGuide || ""}  
                token={token || ""}                
                onSubmit={async ({ guide, token }) => { }}
                showAlert={showAlert === "true" ? true : false}
            />
        </>
    );
}
