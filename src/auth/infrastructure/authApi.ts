import axios from "axios";

export const authApi = axios.create({
  baseURL: "https://tu-api.com",
});
