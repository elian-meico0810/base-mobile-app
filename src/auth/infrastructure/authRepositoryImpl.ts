import { AuthRepository } from "../domain/AuthRepository";
import { authApi } from "./authApi";
import { authStorage } from "./authStorage";

export const authRepositoryImpl: AuthRepository = {
  async login(email, password) {
    const { data } = await authApi.post("/login", { email, password });

    await authStorage.saveToken(data.token);

    return {
      id: data.id,
      email: data.email,
      token: data.token,
    };
  },

  async logout() {
    await authStorage.removeToken();
  },
};
