import React, { useContext } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';
import { Button } from 'react-native-elements';

import { APP_FONTS, APP_THEME, ASYNC_STORAGE_KEYS } from '../constants';
import { SurveyItem } from '../types/survey';
import LocalizationContext from '../context/localizationContext';

type SurveyListHeaderProps = {
  isNetworkConnected: boolean;
  surveys: Array<SurveyItem>;
};

export default function SurveyListHeader(props: SurveyListHeaderProps) {
  const { t } = useContext(LocalizationContext);

  const showRefreshPopup = () => {
    Alert.alert(
      t('SYNCING'),
      t('UPLOAD_SURVEY_MESSAGE'),
      [
        {
          text: t('OK'),
          onPress: () => {
            // this.props.navigation.pop();
            // this.refreshAppData();
          },
        },
        {
          text: t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.pendingSurveyContainer}>
      <TextInput
        underlineColorAndroid="transparent"
        placeholder={t('SEARCH_SURVEYS')}
        style={styles.textStylePendingSurvey}
        value={`0 - ${t('QUEUED_FOR_SYNC')}`} // dirtySurveyCount
        editable={false}
      />
      <View style={styles.syncIconStyle}>
        <Button
          containerStyle={styles.syncButtonContainer}
          titleStyle={
            props.isNetworkConnected
              ? {
                  color: APP_THEME.APP_WHITE,
                  fontFamily: APP_FONTS.FONT_REGULAR,
                }
              : {
                  color: APP_THEME.APP_DARK_FONT_COLOR,
                  fontFamily: APP_FONTS.FONT_REGULAR,
                }
          }
          buttonStyle={
            props.isNetworkConnected
              ? { backgroundColor: APP_THEME.APP_BASE_COLOR }
              : { backgroundColor: APP_THEME.APP_BORDER_COLOR }
          }
          onPress={() => {
            props.isNetworkConnected && this.showRefreshPopup();
          }}
          title="Sync"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textStylePendingSurvey: {
    padding: 10,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    flex: 8,
    backgroundColor: 'white',
    borderColor: APP_THEME.APP_BORDER_COLOR,
    borderWidth: 1,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  pendingSurveyContainer: {
    minHeight: 50,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  syncIconStyle: {
    padding: 8,
    position: 'absolute',
    right: 10,
  },
  syncButtonContainer: {
    minWidth: 80,
  },
});
