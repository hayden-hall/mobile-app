import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LocalizationContext from './context/localizationContext';

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

const Stack = createStackNavigator();

export default function Router() {
  const { t } = useContext(LocalizationContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: t('LOGIN'),
            ...headerStyle,
          }}
        />
        <Stack.Screen
          name="AreaCode"
          component={AreaCode}
          options={{
            title: t('ENTER_AREA_CODE'),
            ...headerStyle,
          }}
        />
        <Stack.Screen
          name="SurveyList"
          component={SurveyList}
          options={({ navigation }) => ({
            title: t('SURVEYS'),
            headerLeft: () => LogoutButton(navigation, t),
            headerRight: () => SettingsButton(navigation),
            ...headerStyle,
          })}
        />
        <Stack.Screen
          name="SurveyTypePicker"
          component={SurveyTypePicker}
          options={{
            title: t('CHOOSE_SURVEY'),
            ...headerStyle,
          }}
        />
        <Stack.Screen
          name="SurveyEditor"
          component={SurveyEditor}
          options={{
            title: t('NEW_SURVEY'),
            ...headerStyle,
          }}
        />
        <Stack.Screen name="SurveyCompleted" component={SurveyCompleted} />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{
            title: t('SETTINGS'),
            ...headerStyle,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
