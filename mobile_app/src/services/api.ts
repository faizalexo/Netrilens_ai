import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

// ⚠️ Replace with your local IP
// Example: http://192.168.1.5:8000/api
const BASE_URL = "http://192.168.1.4:8000/api";

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@auth_access_token",
  REFRESH_TOKEN: "@auth_refresh_token",
  USER: "@auth_user",
};

// ─────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface RefreshResponse {
  access: string;
}

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// ─────────────────────────────────────────────────────────────
// TOKEN HELPERS
// ─────────────────────────────────────────────────────────────

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getUser() {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);

    return user ? JSON.parse(user) : null;
  },

  async setTokens(access: string, refresh: string) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, access],
      [STORAGE_KEYS.REFRESH_TOKEN, refresh],
    ]);
  },

  async setUser(user: unknown) {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user)
    );
  },

  async clearAll() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },
};

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// REFRESH TOKEN LOGIC
// ─────────────────────────────────────────────────────────────

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (
  error: unknown,
  token: string | null = null
) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, password: string) {

    const response = await api.post("/auth/login/", {
      email,
      password,
    });

    const { access, refresh, user } = response.data;

    await tokenStorage.setTokens(access, refresh);
    await tokenStorage.setUser(user);

    api.defaults.headers.common.Authorization =
      `Bearer ${access}`;

    return response.data;
  },

  async logout() {

    await tokenStorage.clearAll();

    delete api.defaults.headers.common.Authorization;
  },

  async hydrateAuth() {

    const token = await tokenStorage.getAccessToken();

    if (token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;
    }
  },
};

// ─────────────────────────────────────────────────────────────
// DEBUG LOGGER
// ─────────────────────────────────────────────────────────────

if (__DEV__) {

  api.interceptors.request.use((config) => {

    console.log(
      `🚀 API REQUEST: ${config.method?.toUpperCase()} ${config.url}`
    );

    return config;
  });

  
}
export const getGoals = async () => {
  try {

    const response = await api.get(
      "/users/get_goals/"
    );

    return response.data;

  } catch (error) {

    console.log("GET GOALS ERROR:", error);

    throw error;
  }
};

export const logoutUser = async () => {
  try {

    await tokenStorage.clearAll();

    delete api.defaults.headers.common.Authorization;

    console.log("✅ User logged out");

  } catch (error) {

    console.log("LOGOUT ERROR:", error);

    throw error;
  }
};

export default api;