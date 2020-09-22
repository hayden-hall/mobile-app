import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import Login from './screens/login';
import AreaCode from './screens/areaCode';
import SurveyList from './screens/surveyList';
import SurveyTypePicker from './screens/surveyTypePicker';
import SurveyEditor from './screens/surveyEditor';
import SurveyCompleted from './screens/surveyCompleted';
import Settings from './screens/settings';

// components
import { SettingsButton, LogoutButton } from './components/headerButtons';

// styles
import { APP_FONTS, APP_THEME } from './constants';
import i18n from './config/i18n';

const headerStyle = {
  headerStyle: {
    backgroundColor: APP_THEME.NAVIGATION_BACKGROUND,
  },
  headerTintColor: APP_THEME.APP_BASE_FONT_COLOR,
  headerTitleStyle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: APP_FONTS.FONT_BOLD,
  },
};

export type StackParamList = {
  Login: undefined;
  AreaCode: undefined;
  SurveyList: {
    isLocalizationPrepared?: boolean;
  };
  SurveyTypePicker: undefined;
  SurveyEditor: {
    selectedRecordTypeId: string;
    selectedLayoutId: string;
  };
  SurveyCompleted: undefined;
  Settings: undefined;
};

export const LocalizationContext = React.createContext(null);
const Stack = createStackNavigator();

export default function Router() {
  const [locale, setLocale] = React.useState(i18n.locale);
  const localizationContext = React.useMemo(
    () => ({
      t: (scope, options) => i18n.t(scope, { locale, ...options }),
      locale,
      setLocale,
    }),
    [locale]
  );

  return (
    <LocalizationContext.Provider value={localizationContext}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: i18n.t('LOGIN'),
              ...headerStyle,
            }}
          />
          <Stack.Screen
            name="AreaCode"
            component={AreaCode}
            options={{
              title: i18n.t('ENTER_AREA_CODE'),
              ...headerStyle,
            }}
          />
          <Stack.Screen
            name="SurveyList"
            component={SurveyList}
            options={({ navigation }) => ({
              title: i18n.t('SURVEYS'),
              headerLeft: () => LogoutButton(navigation),
              headerRight: () => SettingsButton(navigation),
              ...headerStyle,
            })}
          />
          <Stack.Screen
            name="SurveyTypePicker"
            component={SurveyTypePicker}
            options={{
              title: i18n.t('CHOOSE_SURVEY'),
              ...headerStyle,
            }}
          />
          <Stack.Screen name="SurveyEditor" component={SurveyEditor} />
          <Stack.Screen name="SurveyCompleted" component={SurveyCompleted} />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
              title: i18n.t('SETTINGS'),
              ...headerStyle,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LocalizationContext.Provider>
  );
}
