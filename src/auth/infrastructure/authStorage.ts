import * as SecureStore from "expo-secure-store";

export const authStorage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync("AUTH_TOKEN", token);
  },
  async getToken() {
    return await SecureStore.getItemAsync("AUTH_TOKEN");
  },
  async removeToken() {
    return await SecureStore.deleteItemAsync("AUTH_TOKEN");
  },
};
