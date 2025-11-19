import { ApiResponse } from "./ApiResponse";
import { AuthUser } from "./AuthUser";

export interface AuthRepository {
  login: (guide: string) => Promise<ApiResponse<AuthUser>>;
  logout(): Promise<void>;
}
