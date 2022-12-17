import { UserDto } from "@dtos/userDTO";
import { createContext, ReactNode, useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { api } from "@services/api";

import {
  storageUserGet,
  storageUserRemove,
  storageUserSave,
} from "@storage/storageUser";

import {
  storageAuthToken,
  storageAuthTokenGet,
  storageAuthTokenRemove,
} from "@storage/storageAuthToken";

export type AuthContextDataProps = {
  user: UserDto;
  signIn: (email: string, password: string) => Promise<void>;
  isLoadingUserStorageData: boolean;
  signOut: () => void;
  updateUserProfile: (userUpdate: UserDto) => Promise<void>;
  refreshToken: string;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState({
    id: "",
    avatar: "",
    email: "",
    name: "",
  });
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
    useState(true);
  const [refreshToken, SetRefreshToken] = useState("");

  async function UserAndTokenUpdate(userData: UserDto, token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(userData);
  }

  async function storageUserAndTokenSave(userData: UserDto, token: string) {
    try {
      setIsLoadingUserStorageData(true);
      await storageUserSave(userData);
      await storageAuthToken(token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post("sessions", { email, password });

      if (data.user && data.token) {
        setIsLoadingUserStorageData(true);
        await storageUserAndTokenSave(data.user, data.token);
        UserAndTokenUpdate(data.user, data.token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true);
      setUser({} as UserDto);
      await storageUserRemove();
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function updateUserProfile(userUpdate: UserDto) {
    try {
      setUser(userUpdate);
      await storageUserSave(userUpdate);
    } catch (error) {
      throw error;
    }
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);
      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();

      if (userLogged && token) {
        UserAndTokenUpdate(userLogged, token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }
  async function biometria() {
    let compatible = await LocalAuthentication.hasHardwareAsync();

    if (compatible) {
      let biometriaRecord = await LocalAuthentication.isEnrolledAsync();
      if (!biometriaRecord) {
        alert("Biometria não cadastrada");
      } else {
        const token = await storageAuthTokenGet();
        if(token){
          let result = await LocalAuthentication.authenticateAsync();
          console.log('result',result)
          if (result.success) {
            loadUserData();
          } else {
            storageUserRemove();
            storageAuthTokenRemove()
            setIsLoadingUserStorageData(false);
          }
        }else{
          setIsLoadingUserStorageData(false);
        }
      }
    }
  }

  function refreshTokenUpdate(newToken: string) {
    SetRefreshToken(newToken);
  }

  useEffect(() => {
    biometria();
  }, []);

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager({
      signOut,
      refreshTokenUpdate,
    });

    return () => {
      subscribe();
    };
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        isLoadingUserStorageData,
        signOut,
        updateUserProfile,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
