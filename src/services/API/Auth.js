import { ASYNC_STORAGE_KEYS } from '../../constants';
import { LOGIN_API_URL } from 'react-native-dotenv';

export const login = async (email, password) => {
  return new Promise(async (resolve, reject) => {
    const data = { email, password };
    try {
      let response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        let responseJson = await response.json();
        console.log(responseJson);
        if (responseJson.access_token) {
          storage.save({
            key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
            data: responseJson.access_token
          });
        }
        if (responseJson.instance_url) {
          storage.save({
            key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
            data: responseJson.instance_url
          });
        }
        resolve(responseJson);
      } else {
        let responseText = await response.text();
        reject(responseText);
      }
    } catch (error) {
      console.log('ERROR', error);
      reject(error);
    }
  });
};
