import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
   baseURL: "http://192.168.1.4:8000/api/",  // 👈 YOUR IP // Replace with your PC LAN IP
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;


export const getGoals = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("http://192.168.1.4:8000/api/users/get_goals/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.log(error);
  }
};
