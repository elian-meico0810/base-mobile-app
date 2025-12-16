import axios from "axios";

export const authApi = axios.create({
  //baseURL: "http://127.0.0.1:8000/api/",
  // baseURL: "http://40.124.182.81:8080/api/",
    baseURL: "http://192.168.70.13:8080/api/",

});

export const authDevApi = axios.create({
  baseURL: "http://192.168.1.231/api-pagos/api/"
});
