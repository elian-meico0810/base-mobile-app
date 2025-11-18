import { AuthUser } from "./AuthUser";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
}
