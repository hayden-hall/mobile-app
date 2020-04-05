import { Alert, AsyncStorage } from 'react-native';
import Storage from 'react-native-storage';
import moment from 'moment';

import { ASYNC_STORAGE_KEYS } from '../constants';
import { clearDatabase } from '../services/Database';

import i18n from '../config/i18n';

const DATE_FORMAT = 'MMM DD, YYYY';
const DATE_FORMAT_API = 'YYYY-MM-DD';
export const UTC_TIME_FORMAT = 'YYYY-MM-DDTHH:MM';

export const validateEmail = email => {
  const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(emailFormat)) {
    return true;
  }
  return false;
};

export const formatDate = date => {
  return moment(date).format(DATE_FORMAT);
};

export const formatAPIDate = date => {
  return moment(date).format(DATE_FORMAT_API);
};

export const prepareIdsForSalesforce = contactsIds => {
  return contactsIds
    .filter(record => record)
    .map(contact => `'${contact}'`)
    .join(',');
};

export const prepareIdsForSqllite = contactsIds => {
  return contactsIds
    .filter(record => record)
    .map(contact => `"${contact}"`)
    .join(',');
};

export const checkForDatabaseNull = value => {
  return value && value != null && value != 'null';
};

export const initializeStorage = () => {
  // @ts-ignore
  global.storage = new Storage({
    size: 1000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
  });
};

export const clearStorage = () => {
  for (const k of Object.keys(ASYNC_STORAGE_KEYS)) {
    // @ts-ignore
    storage.remove({
      key: ASYNC_STORAGE_KEYS[k],
    });
  }
};

export const makeLogout = navigation => {
  Alert.alert(
    i18n.t('LOGOUT'),
    i18n.t('LOGOUT_MESSAGE'),
    [
      {
        text: i18n.t('OK'),
        onPress: async () => {
          clearStorage();
          await clearDatabase();
          navigation.replace('Login', { headerTitle: i18n.t('LOGIN') });
        },
      },
      {
        text: i18n.t('CANCEL'),
      },
    ],
    { cancelable: true }
  );
};
