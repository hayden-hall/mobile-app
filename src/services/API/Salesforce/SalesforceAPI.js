import Config from 'react-native-config';
import AsyncStorage from '@react-native-community/async-storage';
import { ASYNC_STORAGE_KEYS } from '../../../constants';

const SALESFORCE_API_VERSION = 'v45.0';

export const SALESFORCE_CREATE_OBJECT_NAME = {
  SURVEYS: 'Surveys'
};

export const loginUser = async () => {
  var formData = new FormData();
  formData.append('grant_type', 'password');
  formData.append('client_id', Config.SALESFORCE_CONNECTED_APP_CLIENT_ID);
  formData.append('client_secret',Config.SALESFORCE_CONNECTED_APP_CLIENT_SECRET);
  formData.append('username', Config.SALESFORCE_INTEGRATION_USERNAME);
  formData.append('password', Config.SALESFORCE_INTEGRATION_PASSWORD);
  try {
    let response = await fetch(
      'https://login.salesforce.com/services/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    );
    let responseJson = await response.json();
    console.log(responseJson);
    if (responseJson.access_token) {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
        responseJson.access_token
      );
    }
    if (responseJson.instance_url) {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
        responseJson.instance_url
      );
    }
    return responseJson;
  } catch (error) {
    console.error(error);
    return '';
  }
};

export const getDataFromQuery = async query => {
  try {
    const access_token = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN
    );
    const baseURL = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL
    );
    const url = `${baseURL}/services/data/${SALESFORCE_API_VERSION}/query/?q=${query}`;
    console.log('URL', url);
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    let responseJson = await response.json();
    console.log(responseJson);
    return responseJson;
  } catch (error) {
    console.log('ERROR', error);
  }
};

export const createNewObject = async (objectName, body) => {
  try {
    const access_token = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN
    );
    const baseURL = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL
    );
    console.log('PAYLOAD', body);
    const url = `${baseURL}/services/data/${SALESFORCE_API_VERSION}/sobjects/${objectName}/`;
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify(body)
    });
    let responseJson = await response.json();
    console.log('NEW OBJECT RESPONSE', responseJson);
    return responseJson;
  } catch (error) {
    console.log('NEW OBJECT error', error);
    console.error(error);
    return '';
  }
};