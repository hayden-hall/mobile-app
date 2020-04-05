import React from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { CustomButton } from '../../components';
import i18n from '../../config/i18n';
import { Icon } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../../constants';

import { makeLogout } from '../../utility';

interface SurveyCompletedProps {
  navigation: any;
}

export default class SurveyCompleted extends React.Component<SurveyCompletedProps> {
  static navigationOptions = {
    title: ({ state }) => 'state.params.name',
  };

  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  };

  handleBackButton = () => {
    return true;
  };

  render = () => {
    const { container, textStyle, inputButton, check } = styles;
    return (
      <View style={container}>
        <Icon
          name="ios-checkmark-circle"
          size={45}
          iconStyle={check}
          color={APP_THEME.APP_BASE_COLOR}
          type="ionicon"
          onPress={() => {
            makeLogout(this.props.navigation);
          }}
        />
        <Text style={textStyle}>Survey Completed</Text>
        <View style={inputButton}>
          <CustomButton
            title={i18n.t('VIEW_SURVEY_LIST')}
            onPress={() => {
              this.props.navigation.navigate('SurveyList', {
                headerTitle: i18n.t('SURVEYS'),
              });
            }}
          />
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    padding: 20,
    fontSize: 24,
    lineHeight: 22,
    fontFamily: APP_FONTS.FONT_LIGHT,
    color: APP_THEME.APP_DARK_FONT_COLOR,
    paddingTop: 5,
    paddingBottom: 5,
  },
  check: {
    padding: 20,
  },
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 },
});
