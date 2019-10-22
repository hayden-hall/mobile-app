import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { TextInput, CustomButton, Loader } from '../../../components';
import { APP_THEME } from '../../../constants';
import { labels } from '../../../stringConstants';
import { validateEmail } from '../../../utility';
import { login } from '../../../services/API/Auth';
import AsyncStorage from '@react-native-community/async-storage';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20
  },
  logoStyle: { height: 181, width: 181 },
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

export default class Login extends PureComponent {
  state = {
    emailError: '',
    passwordError: '',
    loginFailError: '',
    email: '',
    password: '',
    isAppLoading: false
  };

  showHideLoading = show => {
    this.setState({ isAppLoading: show });
  };

  validateInput = () => {
    const { email, password } = this.state;
    if (email.length == 0) {
      this.setState({ emailError: labels.ENTER_EMAIL });
      return false;
    }
    if (!validateEmail(email)) {
      this.setState({ emailError: labels.ENTER_VALID_EMAIL });
      return false;
    }
    if (password.length == 0) {
      this.setState({ passwordError: labels.ENTER_PASSWORD });
      return false;
    }
    this.setState({ emailError: '', passwordError: '' });
    return true;
  };

  makeLogin = async () => {
    if (this.validateInput()) {
      try {
        const { email, password } = this.state;
        this.showHideLoading(true);
        const loginResponse = await login(email, password);
        this.showHideLoading(false);
        if (loginResponse.access_token && loginResponse.instance_url) {
          if (this.props.isLoginModal) {
            this.props.loginSuccessfull();
          } else {
            this.props.navigation.replace('AreaCode', {
              headerTitle: labels.AREA_CODE
            });
          }
        } else {
          setTimeout(() => {
            alert(`Invalid login`);
          }, 500);
        }
      } catch (error) {
        this.showHideLoading(false);
        setTimeout(() => {
          alert(`${error}`);
        }, 500);
      }
    }
  };

  componentDidMount = () => {
    this.checkLogin();
  };

  checkLogin = async () => {
    if (!this.props.isLoginModal) {
      this.showHideLoading(true);
      const CDW_Worked_Id = await AsyncStorage.getItem(
        ASYNC_STORAGE_KEYS.CDW_WORKED_ID
      );
      this.showHideLoading(false);
      if (CDW_Worked_Id) {
        this.props.navigation.replace('SurveyList', {
          headerTitle: labels.SURVEYS
        });
      }
    }
  };

  render() {
    const {
      flex1,
      flex2,
      inputBoxesView,
      container,
      logoStyle,
      inputButton
    } = styles;
    return (
      <KeyboardAwareScrollView style={flex1}>
        <Loader loading={this.state.isAppLoading} />
        <View style={container}>
          <Image
            source={require('../../../../assets/images/haydenhallicon.png')}
            style={logoStyle}
          />
        </View>
        <View style={inputBoxesView}>
          <TextInput
            onChangeText={email => {
              this.setState({ email });
            }}
            value={this.state.email}
            label={labels.EMAIL}
            placeholder="jon@mtxb2b.com"
            errorStyle={{ color: 'red' }}
            keyboardType="email-address"
            errorMessage={this.state.emailError}
          />
          <TextInput
            onChangeText={password => {
              this.setState({ password });
            }}
            value={this.state.password}
            label={labels.PASSWORD}
            placeholder="password"
            errorStyle={{ color: 'red' }}
            secureTextEntry
            errorMessage={this.state.passwordError}
          />
          <View style={inputButton}>
            <CustomButton title={labels.LOGIN} onPress={this.makeLogin} />
          </View>
        </View>
        <View style={flex2} />
      </KeyboardAwareScrollView>
    );
  }
}
