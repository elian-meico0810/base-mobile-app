import { ConciliationSummary } from "@/src/ui/tracking/conciliation/ConciliationSummaryForm";
import { Stack, useLocalSearchParams } from "expo-router";

export default function ConciliationSummaryScreen() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const receivedGuide = params.guide as string;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Resumen de cuadre",
          headerShown: false,
        }}
      />
      <ConciliationSummary
        guide={receivedGuide || ""}
        token={token || ""}
      />
    </>
  );
}
