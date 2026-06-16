import { API_ROUTES } from "@/src/constants/apiRoutes";
import Constants from 'expo-constants';
import { AuthRepository } from "../../domain/login/AuthRepository";
import { authApi } from "../authApi";
import { authStorage } from "./authStorage";

const appVersion =
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.VERSION_APP ||
  (Constants.manifest?.extra as Record<string, string> | undefined)?.VERSION_APP ||
  process.env.VERSION_APP;

export const authRepositoryImpl: AuthRepository = {
  async login(guide: string) {
    const payload = {
      idGuia: Number(guide),
      empresa: "Meico",
      version: String(appVersion),
    };
    const { data } = await authApi.post(API_ROUTES.LOGIN_GUIDE, payload);
    return data
    
  },

  async logout() {
    await authStorage.removeToken();
  },
};
