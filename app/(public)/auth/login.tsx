import { loginUseCase } from "@/src/features/auth/application/login/login.usecase";
import { authRepositoryImpl } from "@/src/features/auth/infrastructure/login/authRepositoryImpl";
import { LoginForm } from "@/src/ui/auth/LoginForm";
import { useRouter } from "expo-router";

export default function LoginPage() {
  const router = useRouter();
  const login = loginUseCase(authRepositoryImpl);

  async function handleLogin(guide: string) {
    try {
      await login(guide);
    } catch (err) {
      console.log("Error login:", err);
    }
  }

  return <LoginForm onSubmit={handleLogin} />;
}
