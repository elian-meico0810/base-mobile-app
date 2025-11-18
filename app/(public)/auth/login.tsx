import { loginUseCase } from "@/src/auth/application/login.usecase";
import { authRepositoryImpl } from "@/src/auth/infrastructure/authRepositoryImpl";
import { LoginForm } from "@/src/ui/auth/LoginForm";
import { useRouter } from "expo-router";

export default function LoginPage() {
  const router = useRouter();
  const login = loginUseCase(authRepositoryImpl);

  async function handleLogin(email: string, pass: string) {
    try {
      await login(email, pass);
    } catch (err) {
      console.log("Error login:", err);
    }
  }

  return <LoginForm onSubmit={handleLogin} />;
}
