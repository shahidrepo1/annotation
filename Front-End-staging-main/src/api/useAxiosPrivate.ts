import axios, { type AxiosError } from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useRefreshToken } from "./useRefreshToken";
import { useUser } from "../store/useUser";
import { axiosInstance } from "./apiConstants";

export const useAxiosPrivate = () => {
  const { accessToken, updateAccessToken } = useUser();
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const retriedRequests = new Set<string>();

    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<{ messages: string }>) => {
        if (axios.isAxiosError(error)) {
          const responseStatus = error.response?.status;
          const originalRequest = error.config;

          const alreadyRetried = retriedRequests.has(
            originalRequest?.url ?? ""
          );

          // Refresh token logic
          if (originalRequest && responseStatus === 401 && !alreadyRetried) {
            retriedRequests.add(originalRequest.url ?? "");
            try {
              const res = await refresh();
              const newAccessToken = res.data.accessToken;
              updateAccessToken(newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return await axiosInstance(originalRequest);
            } catch (retriedReqError) {
              return Promise.reject(retriedReqError as Error);
            }
          }

          // Refresh token expired
          if (responseStatus === 403) {
            void navigate("/login", {
              state: {
                from: location.pathname + location.search,
              },
            });
          }

          return Promise.reject(error);
        }

        return Promise.reject(new Error("Unexpected error occurred."));
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [
    accessToken,
    refresh,
    updateAccessToken,
    location.pathname,
    location.search,
    navigate,
  ]);

  return axiosInstance;
};
