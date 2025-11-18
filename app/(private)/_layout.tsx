import { authStorage } from "@/src/auth/infrastructure/authStorage";
import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function PrivateLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const token = await authStorage.getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      setLoading(false);
    }
    check();
  }, []);

  if (loading) return null;

  return <Slot />;
}
