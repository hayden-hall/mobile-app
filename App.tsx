import React, { useState, useMemo, useEffect } from 'react';
import * as Font from 'expo-font';

import Router from './src/router';
import i18n from './src/config/i18n';
import { initializeStorage } from './src/utility/storage';
import LocalizationContext from './src/context/localizationContext';

console.disableYellowBox = true;
initializeStorage();

export default function App() {
  const [locale, setLocale] = useState(i18n.locale);
  const [fontLoaded, setFontLoaded] = useState(false);

  const localizationContext = useMemo(
    () => ({
      t: (scope, options) => i18n.t(scope, { locale, ...options }),
      locale,
      setLocale,
    }),
    [locale]
  );

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'SalesforceSans-Regular': require('./assets/fonts/SalesforceSans-Regular.ttf'),
        'SalesforceSans-Bold': require('./assets/fonts/SalesforceSans-Bold.ttf'),
        'SalesforceSans-Light': require('./assets/fonts/SalesforceSans-Light.ttf'),
      });
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  return fontLoaded ? (
    <LocalizationContext.Provider value={localizationContext}>
      <Router />
    </LocalizationContext.Provider>
  ) : null;
}
