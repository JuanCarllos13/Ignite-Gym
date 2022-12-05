import AsyncStorage from "@react-native-async-storage/async-storage";

import { AUTH_TOKEN } from "@storage/storageConfig";

export async function storageAuthToken(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN, token);
}

export async function storageAuthTokenGet() {
  const token = await AsyncStorage.getItem(AUTH_TOKEN);
  return token;
}

export async function storageAuthTokenRemove() {
  await AsyncStorage.removeItem(AUTH_TOKEN);
}
