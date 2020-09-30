import moment from 'moment';

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
