import { AppError } from "@utils/AppError";
import axios, { AxiosInstance } from "axios";
import {
  storageAuthTokenGet,
  storageAuthToken,
} from "@storage/storageAuthToken";

type PromiseType = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

type RegisterInterceptTokenManagerProps = {
  signOut: () => void;
  refreshTokenUpdate: (newToken: string) => void;
};

type processQueueParams = {
  error: Error | null;
  token: string | null;
};

type ApiInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: ({}: RegisterInterceptTokenManagerProps) => () => void;
};

let isRefreshing = false;
let felidQueue: Array<PromiseType> = [];

const processQueue = ({ error, token = null }: processQueueParams): void => {
  felidQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
    felidQueue = [];
  });
};

const api = axios.create({
  baseURL: "http://192.168.1.15:3333",
}) as ApiInstanceProps;

api.registerInterceptTokenManager = ({ refreshTokenUpdate, signOut }) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    async (requestError) => {
      if (requestError.response?.status === 401) {
        if (
          requestError.response.data?.message === "token.expired" ||
          requestError.response.data?.message === "token.invalid"
        ) {
          const oldToken = await storageAuthTokenGet();

          if (!oldToken) {
            signOut();
            return Promise.reject(requestError);
          }

          const originalRequest = requestError.config;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              felidQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return axios(originalRequest);
              })
              .catch((error) => {
                throw error;
              });
          }

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post("/sessions/refresh-token", {
                token: oldToken,
              });
              await storageAuthToken(data.token);

              api.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.token}`;

              originalRequest.headers["Authorization"] = `Bearer ${data.token}`;

              refreshTokenUpdate(data.token);

              processQueue({ error: null, token: data.token });

              resolve(originalRequest);
            } catch (error: any) {
              processQueue({ error, token: null });
              signOut();
              reject(error);
            } finally {
              isRefreshing = false;
            }
          });
        }

        signOut();
      }

      if (requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message));
      } else {
        return Promise.reject(requestError);
      }
    }
  );

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

export { api };
