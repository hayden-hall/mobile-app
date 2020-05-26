import { ASYNC_STORAGE_KEYS } from '../../constants';
import { LOGIN_API_URL, REFRESH_KEY } from 'react-native-dotenv';

interface LoginResponse {
  access_token: string;
  instance_url: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return new Promise(async (resolve, reject) => {
    const data = { email, password };
    try {
      const response = await fetch(`${LOGIN_API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseJson = await saveToken(response);
      resolve(responseJson);
    } catch (error) {
      console.log('ERROR', error);
      reject(error);
    }
  });
};

export const refreshAccessToken = async (): Promise<LoginResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${LOGIN_API_URL}/token`, {
        method: 'POST',
        body: JSON.stringify({ refreshKey: REFRESH_KEY }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseJson = await saveToken(response);
      resolve(responseJson);
    } catch (error) {
      console.log('ERROR', error);
      reject(error);
    }
  });
};

const saveToken = async (response): Promise<LoginResponse> => {
  return new Promise(async (resolve, reject) => {
    if (response.status === 200) {
      const responseJson: LoginResponse = await response.json();
      if (responseJson.access_token) {
        // @ts-ignore
        storage.save({
          key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
          data: responseJson.access_token,
        });
      }
      if (responseJson.instance_url) {
        // @ts-ignore
        storage.save({
          key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
          data: responseJson.instance_url,
        });
      }
      resolve(responseJson);
    } else {
      const responseText = await response.text();
      reject(responseText);
    }
  });
};
