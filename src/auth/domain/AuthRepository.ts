import { AuthUser } from "./AuthUser";

export interface AuthRepository {
  login(guide: string): Promise<AuthUser>;
  logout(): Promise<void>;
}
