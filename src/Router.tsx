import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import Login from './screens/login';
import AreaCode from './screens/areaCode';
import SurveyList from './screens/surveyList';
import Survey from './screens/Survey';
import SurveyCompleted from './screens/surveyCompleted';
import Settings from './screens/Settings';

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

const Stack = createStackNavigator();

export default function Router() {
  return (
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
            headerRight: () => SettingsButton(),
            ...headerStyle,
          })}
        />
        <Stack.Screen name="SurveyTypePicker" component={Survey} />
        <Stack.Screen name="SurveyEditor" component={Survey} />
        <Stack.Screen name="SurveyCompleted" component={SurveyCompleted} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
