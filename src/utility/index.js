import { AsyncStorage } from 'react-native';
import Storage from 'react-native-storage';
import moment from 'moment';


const DATE_FORMAT = 'MMM DD, YYYY';
const DATE_FORMAT_API = 'YYYY-MM-DD';
const DATE_FORMAT_MM_DD = 'MM/DD/YYYY';
const DATE_FORMAT_DD_MM = 'DD/MM/YYYY';
const DATE_FORMAT_DD_MM_YYYY = 'DD-MM-YYYY';
const DATE_FORMAT_WITH_TIME = 'MMM DD YYYY, hh:mm a';
const TIME_ONLY = 'hh:mm a';
export const UTC_TIME_FORMAT = 'YYYY-MM-DDTHH:MM';

export const validateEmail = email => {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(mailformat)) {
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
  return (commaSeparatedIds = contactsIds
    .filter(record => record)
    .map(contact => `'${contact}'`)
    .join(','));
};

export const prepareIdsForSqllite = contactsIds => {
  return (commaSeparatedIds = contactsIds
    .filter(record => record)
    .map(contact => `"${contact}"`)
    .join(','));
};

export const checkForDatabaseNull = value => {
  return value && value != null && value != 'null';
};

export const initializeStorage = () => {
  global.storage = new Storage({
      size: 1000,
      storageBackend: AsyncStorage,
      defaultExpires: 1000 * 3600 * 24,
      enableCache: true
  });    
};
