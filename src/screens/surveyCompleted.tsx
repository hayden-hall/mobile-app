import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { Icon } from 'react-native-elements';

import { CustomButton } from '../components';

import { APP_THEME, APP_FONTS } from '../constants';
import i18n from '../config/i18n';

export default function SurveyCompleted({ navigation }) {
  /**
   * @description Handle back button for Android,
   */
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        return true;
      });
    };
  }, []);

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
          // TODO: Needs? makeLogout(this.props.navigation);
        }}
      />
      <Text style={textStyle}>Survey Completed</Text>
      <View style={inputButton}>
        <CustomButton
          title={i18n.t('VIEW_SURVEY_LIST')}
          onPress={() => {
            navigation.navigate('SurveyList');
          }}
        />
      </View>
    </View>
  );
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
