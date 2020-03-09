import React from 'react';
import { Alert } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Icon } from 'react-native-elements';
import { compose } from 'recompose';

import { clearStorage } from './utility';
import { clearDatabase } from './services/Database';

import withImageBackground from './hoc/withImageBackground';

import Login from './screens/Auth/Login';
import AreaCode from './screens/Auth/AreaCode';
import SurveyList from './screens/SurveyList';
import SurveyPicker from './screens/NewSurvey/SurveyPicker';
import MotherPicker from './screens/NewSurvey/SurveyPicker/MotherPicker';
import BeneficiaryPicker from './screens/NewSurvey/SurveyPicker/BeneficiaryPicker';
import ChildPicker from './screens/NewSurvey/SurveyPicker/ChildPicker';
import NewSurvey from './screens/NewSurvey';
import SurveyCompleted from './screens/NewSurvey/SurveyCompleted';
import Settings from './screens/Settings';

import { APP_FONTS, APP_THEME } from './constants';
import i18n from './config/i18n';

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
      headerLeft: () => null,
      gestureEnabled: false
    };
  } else if (rightButton) {
    return {
      ...navbarStyle(),
      headerTitle: title,
      headerLeft: () => leftButton,
      headerRight: () => rightButton
    };
  } else {
    return {
      ...navbarStyle(),
      headerTitle: title,
      headerLeft: () => leftButton
    };
  }
};

makeLogout = navigation => {
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
        }
      },
      {
        text: i18n.t('CANCEL')
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
            navigation.navigate('SurveyList', { headerTitle: i18n.t('SURVEYS') });
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
            headerTitle: i18n.t('LANGUAGE'),
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
      Login: getScreen(Login, i18n.t('LOGIN')),
      AreaCode: getScreen(AreaCode, i18n.t('ENTER_AREA_CODE')),
      SurveyList: getScreen(
        SurveyList,
        i18n.t('SURVEYS'),
        BACK_BUTTON_TYPE.LOGOUT,
        RIGHT_BUTTON_TYPE.SETTINGS
      ),
      SurveyPicker: getScreen(SurveyPicker, i18n.t('CHOOSE_SURVEY')),
      MotherPicker: getScreen(MotherPicker, i18n.t('CHOOSE_MOTHER')),
      BeneficiaryPicker: getScreen(
        BeneficiaryPicker,
        i18n.t('CHOOSE_BENEFIACIARY')
      ),
      ChildPicker: getScreen(ChildPicker, i18n.t('CHOOSE_CHILD')),
      NewSurvey: getScreen(NewSurvey, i18n.t('NEW_SURVEY')),
      SurveyCompleted: getScreen(
        SurveyCompleted,
        i18n.t('SURVEY_COMPLETED'),
        BACK_BUTTON_TYPE.NONE
      ),
      Settings: getScreen(Settings, i18n.t('LANGUAGE'), BACK_BUTTON_TYPE.BACK)
    },
    {
      initialRouteName: 'Login'
    }
  )
);
