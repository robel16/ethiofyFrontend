// API client configuration
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ENV } from "./env";

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: ENV.API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Try to refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${ENV.API_BASE_URL}/auth/refresh-token`,
              {
                refresh_token: refreshToken,
              }
            );

            if (response.data.success) {
              const { access_token, refresh_token: newRefreshToken } =
                response.data.data;
              localStorage.setItem("access_token", access_token);
              localStorage.setItem("refresh_token", newRefreshToken);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return client(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        // If refresh fails, clear tokens but don't redirect immediately
        // Let the auth context handle the redirect
        if (typeof window !== "undefined") {
          console.log("API: Token refresh failed, clearing tokens");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Don't redirect here - let the auth context handle it
          // window.location.href = "/auth/login";
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const api = createApiClient();

// Legacy export for backward compatibility
export const apiClient = api;

// Helper function for making API requests
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<T>(config);
  return response.data;
};
