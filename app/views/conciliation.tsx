import { ConciliationForm } from "@/src/ui/tracking/conciliation/ConciliationForm";
import { Stack, useLocalSearchParams } from "expo-router";

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const receivedGuide = params.guide as string;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Cuadre de caja",
          headerShown: false,
        }}
      />
      <ConciliationForm
        initialGuide={receivedGuide || ""}
        token={token || ""}
        onSubmit={async ({ guide, token }) => {}}
      />
    </>
  );
}
