import { Alert } from 'react-native';

import { clearDatabase } from '../services/Database';
import { clearStorage } from '../utility/storage';

import i18n from '../config/i18n';

export const logout = navigation => {
  Alert.alert(
    i18n.t('LOGOUT'),
    i18n.t('LOGOUT_MESSAGE'),
    [
      {
        text: i18n.t('OK'),
        onPress: async () => {
          clearStorage();
          await clearDatabase();
          navigation.navigate('Login');
        },
      },
      {
        text: i18n.t('CANCEL'),
      },
    ],
    { cancelable: true }
  );
};
