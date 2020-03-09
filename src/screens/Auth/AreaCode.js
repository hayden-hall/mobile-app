import React, { PureComponent } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { TextInput, CustomButton } from '../../components';
import i18n from '../../config/i18n';
import { getCDWContact } from '../../services/API/Salesforce/Contact';
import { ASYNC_STORAGE_KEYS } from '../../constants';
import { refreshAll } from '../../services/Refresh';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  logoStyle: { height: 61, width: 181 },
  inputBoxesView: {
    flex: 3,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  flex1: {
    flex: 1
  },
  flex2: {
    flex: 2
  },
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 }
});

export default class AreaCode extends PureComponent {
  state = {
    areaCodeError: '',
    areaCode: ''
  };

  validateInput = () => {
    const { areaCode } = this.state;
    if (areaCode.length == 0) {
      this.setState({ areaCodeError: i18n.t('ENTER_AREA_CODE') });
      return false;
    }
    this.setState({ areaCodeError: '' });
    return true;
  };

  checkAreaCode = async () => {
    if (this.validateInput()) {
      this.props.showsSpinner(true);
      const response = await getCDWContact(this.state.areaCode);
      this.props.showsSpinner(false);
      if (response.records && response.records.length > 0) {
        const workerContact = response.records[0];
        storage.save({
          key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
          data: workerContact.Id
        });
        storage.save({
          key: ASYNC_STORAGE_KEYS.AREA_CODE,
          data: this.state.areaCode
        });
        storage.save({
          key: ASYNC_STORAGE_KEYS.CDW_WORKED_NAME,
          data: workerContact.Name
        });
        this.refreshAppData();
      } else {
        setTimeout(() => {
          alert(i18n.t('AREA_CODE_NOT_FOUND'));
        }, 500);
      }
    }
  };

  refreshAppData = async () => {
    try {
      this.props.showsSpinner(true);
      const result = await refreshAll();
      this.props.showsSpinner(false);
      this.props.navigation.replace('SurveyList', {
        headerTitle: i18n.t('SURVEYS')
      });
    } catch (error) {
      this.props.showsSpinner(false);
      setTimeout(() => {
        alert(`${error}`);
      }, 500);
    }
  };

  componentDidMount = async () => {};

  render() {
    const { flex1, flex2, inputBoxesView, container, inputButton } = styles;
    return (
      <KeyboardAvoidingView style={flex1}>
        <View style={container} />
        <View style={inputBoxesView}>
          <TextInput
            onChangeText={areaCode => {
              this.setState({ areaCode });
            }}
            value={this.state.areaCode}
            label={i18n.t('AREA_CODE')}
            placeholder="3A2276BB"
            errorStyle={{ color: 'red' }}
            errorMessage={this.state.areaCodeError}
          />
          <View style={inputButton}>
            <CustomButton
              title={i18n.t('GO_TO_SURVEY')}
              onPress={this.checkAreaCode}
            />
          </View>
        </View>
        <View style={flex2} />
      </KeyboardAvoidingView>
    );
  }
}
