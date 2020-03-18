import { ASYNC_STORAGE_KEYS } from '../../constants';
import { LOGIN_API_URL } from 'react-native-dotenv';

export const login = async (email: string, password: string) => {
  return new Promise(async (resolve, reject) => {
    const data = { email, password };
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const responseJson = await response.json();
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
    } catch (error) {
      console.log('ERROR', error);
      reject(error);
    }
  });
};
