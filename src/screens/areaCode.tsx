import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ImageBackground } from 'react-native';

import { getCDWContact } from '../services/api/salesforce/Contact';
import { refreshAll } from '../services/Refresh';
import { storeRecordTypes } from '../services/describe';

import { TextInput, CustomButton, Loader } from '../components';

import i18n from '../config/i18n';
import {
  ASYNC_STORAGE_KEYS,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
} from '../constants';
import { logger } from '../utility/logger';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoStyle: { height: 61, width: 181 },
  inputBoxesView: {
    flex: 3,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 },
});

export default function AreaCode({ navigation }) {
  const [areaCode, setAreaCode] = useState('');
  const [areaCodeError, setAreaCodeError] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);

  /**
   * @description Validate area code. Only empty check here.
   */
  const validateInput = () => {
    if (areaCode.length == 0) {
      setAreaCodeError(i18n.t('ENTER_AREA_CODE'));
      throw new Error('Validation error');
    }
    setAreaCodeError(undefined);
  };

  /**
   * @description Retrieve contact detail from Salesforce
   */
  const retrieveContactDetail = async () => {
    setShowsSpinner(true);
    const response = await getCDWContact(areaCode);
    setShowsSpinner(false);

    if (response.records && response.records.length > 0) {
      // TODO: For multiple records?
      const workerContact = response.records[0];
      storage.save({
        key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
        data: workerContact.Id,
      });
      storage.save({
        key: ASYNC_STORAGE_KEYS.AREA_CODE,
        data: areaCode,
      });
      storage.save({
        key: ASYNC_STORAGE_KEYS.CDW_WORKED_NAME,
        data: workerContact.Name,
      });
      await refreshAppData();
    } else {
      setTimeout(() => {
        alert(i18n.t('AREA_CODE_NOT_FOUND'));
      }, 500);
      throw new Error(`Retrieve contact details. ${JSON.stringify(response)}`);
    }
  };

  /**
   * @description Retrieve survey metadata from Salesforce
   */
  const refreshAppData = async () => {
    try {
      setShowsSpinner(true);
      await refreshAll(); // TODO: remove
      await storeRecordTypes('Survey__c'); // TODO: Dynamic
      setShowsSpinner(false);
      navigation.navigate('SurveyList');
    } catch (error) {
      setShowsSpinner(false);
      setTimeout(() => {
        alert(`${error}`);
      }, 500);
      throw new Error(error);
    }
  };

  const { flex1, flex2, inputBoxesView, container, inputButton } = styles;
  return (
    <ImageBackground
      source={BACKGROUND_IMAGE_SOURCE}
      style={BACKGROUND_STYLE}
      imageStyle={BACKGROUND_IMAGE_STYLE}
    >
      <KeyboardAvoidingView style={flex1}>
        <Loader loading={showsSpinner} />
        <View style={container} />
        <View style={inputBoxesView}>
          <TextInput
            onChangeText={areaCode => {
              setAreaCode(areaCode);
            }}
            value={areaCode}
            label={i18n.t('AREA_CODE')}
            placeholder="3A2276BB"
            errorStyle={{ color: 'red' }}
            errorMessage={areaCodeError}
          />
          <View style={inputButton}>
            <CustomButton
              title={i18n.t('GO_TO_SURVEY')}
              onPress={async () => {
                try {
                  validateInput();
                  await retrieveContactDetail();
                  await refreshAppData();
                } catch (error) {
                  logger('ERROR', 'AreaCode', `${error}`);
                }
              }}
            />
          </View>
        </View>
        <View style={flex2} />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
