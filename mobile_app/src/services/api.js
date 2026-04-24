import axios from "axios";

const API = axios.create({
   baseURL: "http://192.168.1.4:8000/api/",  // 👈 YOUR IP // Replace with your PC LAN IP
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
