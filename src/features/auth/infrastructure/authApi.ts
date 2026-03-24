import axios from "axios";

export const authApi = axios.create({
  //baseURL: "http://127.0.0.1:8000/api/",
  // baseURL: "http://40.124.182.81:8080/api/",
  // baseURL: "http://192.168.72.30:8080/api/",
  // baseURL: "https://qa-portal.meico.co/meicotrack/back/api/"
  baseURL:"https://portal.meico.com.co/meitruck/back/api/"
  // baseURL: "http://192.168.72.144:8000/api/", 

});

export const authDevApi = axios.create({
  // baseURL: "https://qa-portal.meico.co/pagos/back/api/"
   baseURL: "https://portal.meico.com.co/pagos/back/api/"
});
