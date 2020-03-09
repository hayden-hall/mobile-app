import { ASYNC_STORAGE_KEYS } from '../../../constants';

const SALESFORCE_API_VERSION = 'v45.0';

export const SALESFORCE_CREATE_OBJECT_NAME = {
  SURVEYS: 'Surveys'
};

export const getDataFromQuery = async query => {
  try {
    const access_token = await storage.load({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN
    });
    const baseURL = await storage.load({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL
    });
    const url = `${baseURL}/services/data/${SALESFORCE_API_VERSION}/query/?q=${query}`;
    console.log('URL', url);
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    let responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.log('ERROR', error);
  }
};

export const createNewObject = async (objectName, body) => {
  try {
    const access_token = await storage.load({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN
    });
    const baseURL = await storage.load({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL
    });
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
