import { AuthRepository } from "../domain/AuthRepository";
import { authApi } from "./authApi";
import { authStorage } from "./authStorage";

export const authRepositoryImpl: AuthRepository = {
  async login(guide: string) {
    const { data } = await authApi.post("/login", { guide });

    await authStorage.saveToken(data.token);

    return {
      guide: data.guide,
    };
  },

  async logout() {
    await authStorage.removeToken();
  },
};
