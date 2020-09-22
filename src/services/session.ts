import { useContext } from 'React';
import { Alert } from 'react-native';

import { clearDatabase } from './database';
import { clearStorage } from '../utility/storage';
import LocalizationContext from '../context/localizationContext';

export const logout = navigation => {
  const { t } = useContext(LocalizationContext);

  Alert.alert(
    t('LOGOUT'),
    t('LOGOUT_MESSAGE'),
    [
      {
        text: t('OK'),
        onPress: async () => {
          clearStorage();
          await clearDatabase();
          navigation.navigate('Login');
        },
      },
      {
        text: t('CANCEL'),
      },
    ],
    { cancelable: true }
  );
};
