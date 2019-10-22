import React from 'react';
import { View, Alert } from 'react-native';
import {
  createSwitchNavigator,
  createStackNavigator,
  createAppContainer
} from 'react-navigation';
import { Icon } from 'react-native-elements';
import { clearAllAsyncKeys } from './src/utility';
import { clearDatabase } from './src/services/Database';

import withImageBackground from './src/hoc/withImageBackground';

import Login from './src/screens/Auth/Login';
import AreaCode from './src/screens/Auth/AreaCode';

import Survey from './src/screens/Survey';
import SurveyList from './src/screens/SurveyList';
import SurveyPicker from './src/screens/NewSurvey/SurveyPicker';
import MotherPicker from './src/screens/NewSurvey/SurveyPicker/MotherPicker';
import BeneficiaryPicker from './src/screens/NewSurvey/SurveyPicker/BeneficiaryPicker';
import ChildPicker from './src/screens/NewSurvey/SurveyPicker/ChildPicker';
import NewSurvey from './src/screens/NewSurvey/';
import SurveyCompleted from './src/screens/NewSurvey/SurveyCompleted';
import Settings from './src/screens/Settings';

import { APP_FONTS, APP_THEME, APP_ROUTE } from './src/constants';
import { labels } from './src/stringConstants';

import { compose } from 'recompose';

let enhance = compose(withImageBackground);

const BACK_BUTTON_TYPE = {
  BACK: 'back',
  LOGOUT: 'logout',
  NONE: 'none'
};

const RIGHT_BUTTON_TYPE = {
  SETTINGS: 'Settings',
  NONE: 'none'
};

navbarStyle = () => {
  return {
    headerStyle: {
      backgroundColor: APP_THEME.NAVIGATION_BACKGROUND
    },
    headerTintColor: APP_THEME.APP_BASE_FONT_COLOR,
    headerTitleStyle: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: APP_FONTS.FONT_BOLD
    }
  };
};

const stackNavigaterOptions = (title, leftButton, rightButton) => {
  if (!leftButton) {
    return {
      ...navbarStyle(),
      headerTitle: title,
      headerLeft: null,
      gesturesEnabled: false
    };
  } else if (rightButton) {
    return {
      ...navbarStyle(),
      headerTitle: title,
      headerLeft: leftButton,
      headerRight: rightButton
    };
  } else {
    return {
      ...navbarStyle(),
      headerTitle: title,
      headerLeft: leftButton
    };
  }
};

makeLogout = navigation => {
  Alert.alert(
    labels.LOGOUT,
    labels.LOGOUT_MESSAGE,
    [
      {
        text: labels.OK,
        onPress: async () => {
          await clearAllAsyncKeys();
          await clearDatabase();
          navigation.replace('Login', { headerTitle: labels.LOGIN });
        }
      },
      {
        text: labels.CANCEL
      }
    ],
    { cancelable: true }
  );
};

decideLeftButton = (navigation, type) => {
  let leftButton = null;
  if (type && type == BACK_BUTTON_TYPE.LOGOUT) {
    leftButton = (
      <Icon
        iconStyle={{ padding: 10 }}
        name="logout"
        size={22}
        color={APP_THEME.APP_BASE_COLOR}
        type="simple-line-icon"
        onPress={() => {
          this.makeLogout(navigation);
        }}
      />
    );
  } else if (
    !navigation.isFirstRouteInParent() &&
    type != BACK_BUTTON_TYPE.NONE
  ) {
    leftButton = (
      <Icon
        iconStyle={{ padding: 10 }}
        name="arrow-back"
        size={22}
        color={APP_THEME.APP_BASE_COLOR}
        type="material"
        onPress={() => {
          if (navigation.state.params.isSettingPage) {
            navigation.navigate('SurveyList', { headerTitle: labels.SURVEYS });
          } else {
            navigation.pop();
          }
        }}
      />
    );
  }
  return leftButton;
};

const getSettingsButton = (navigation, rightButtonType) => {
  if (rightButtonType && rightButtonType == RIGHT_BUTTON_TYPE.SETTINGS) {
    return (
      <Icon
        iconStyle={{ padding: 10 }}
        name="language"
        size={22}
        color={APP_THEME.APP_BASE_COLOR}
        type="font-awesome"
        onPress={() => {
          navigation.push('Settings', {
            headerTitle: labels.LANGUAGE,
            isSettingPage: true
          });
        }}
      />
    );
  }
};

const getScreen = (component, title, type, rightButtonType) => {
  return {
    screen: props => {
      const EnhancedScreen = enhance(component);
      return <EnhancedScreen {...props} />;
    },
    navigationOptions: ({ navigation }) => {
      if (rightButtonType) {
        return stackNavigaterOptions(
          (navigation.state.params && navigation.state.params.headerTitle) ||
            title,
          this.decideLeftButton(navigation, type),
          getSettingsButton(navigation, rightButtonType)
        );
      } else {
        return stackNavigaterOptions(
          (navigation.state.params && navigation.state.params.headerTitle) ||
            title,
          this.decideLeftButton(navigation, type)
        );
      }
    }
  };
};

export default createAppContainer(
  createStackNavigator(
    {
      Login: getScreen(Login, labels.LOGIN),
      AreaCode: getScreen(AreaCode, labels.ENTER_AREA_CODE),
      SurveyList: getScreen(
        SurveyList,
        labels.SURVEYS,
        BACK_BUTTON_TYPE.LOGOUT,
        RIGHT_BUTTON_TYPE.SETTINGS
      ),
      SurveyPicker: getScreen(SurveyPicker, labels.CHOOSE_SURVEY),
      MotherPicker: getScreen(MotherPicker, labels.CHOOSE_MOTHER),
      BeneficiaryPicker: getScreen(
        BeneficiaryPicker,
        labels.CHOOSE_BENEFIACIARY
      ),
      ChildPicker: getScreen(ChildPicker, labels.CHOOSE_CHILD),
      NewSurvey: getScreen(NewSurvey, labels.NEW_SURVEY),
      SurveyCompleted: getScreen(
        SurveyCompleted,
        labels.SURVEY_COMPLETED,
        BACK_BUTTON_TYPE.NONE
      ),
      Settings: getScreen(Settings, labels.LANGUAGE, BACK_BUTTON_TYPE.BACK)
    },
    {
      initialRouteName: 'Login'
    }
  )
);
