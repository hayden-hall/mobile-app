import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Image,
  } from 'react-native';
import { TextInput, CustomButton, Loader } from '../../components';
import i18n from '../../config/i18n';
import { validateEmail } from '../../utility';
import { login } from '../../services/API/Auth';
import { ASYNC_STORAGE_KEYS } from '../../constants';
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
    isLoading: false
  };

  showsSpinner = (showsSpinner) => {
    this.setState({ isAppLoading: showsSpinner });
  };

  validateInput = () => {
    const { email, password } = this.state;
    if (email.length == 0) {
      this.setState({ emailError: i18n.t('ENTER_EMAIL') });
      return false;
    }
    if (!validateEmail(email)) {
      this.setState({ emailError: i18n.t('ENTER_VALID_EMAIL') });
      return false;
    }
    if (password.length == 0) {
      this.setState({ passwordError: i18n.t('ENTER_PASSWORD') });
      return false;
    }
    this.setState({ emailError: '', passwordError: '' });
    return true;
  };

  makeLogin = async () => {
    if (this.validateInput()) {
      try {
        const { email, password } = this.state;
        this.showsSpinner(true);
        const loginResponse = await login(email, password);
        this.showsSpinner(false);
        if (loginResponse.access_token && loginResponse.instance_url) {
          if (this.props.isLoginModal) {
            this.props.loginSuccessfull();
          } else {
            this.props.navigation.replace('AreaCode', {
              headerTitle: i18n.t('AREA_CODE')
            });
          }
        } else {
          setTimeout(() => {
            alert(`Invalid login`);
          }, 500);
        }
      } catch (error) {
        this.showsSpinner(false);
        setTimeout(() => {
          alert(`${error}`);
        }, 500);
      }
    }
  };

  componentDidMount = () => {
    this.hasLoggedIn();
  };
  
  hasLoggedIn = async () => {
    if (!this.props.isLoginModal) {
      this.showsSpinner(true);
      const CDW_Worked_Id = await storage.load({
        key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID
      }).catch(error => {
        //User not logged in
      });
      this.showsSpinner(false);
      //if user already logged in (= has CDW Id), navigate to survey list
      if (CDW_Worked_Id) {
        this.props.navigation.replace('SurveyList', {
          headerTitle: i18n.t('SURVEYS')
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
        <Loader loading={this.state.isLoading} />
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
            label={i18n.t('EMAIL')}
            placeholder="john@example.com"
            errorStyle={{ color: 'red' }}
            keyboardType='email-address'
            errorMessage={this.state.emailError}
          />
          <TextInput
            onChangeText={password => {
              this.setState({ password });
            }}
            value={this.state.password}
            label={i18n.t('PASSWORD')}
            placeholder="password"
            errorStyle={{ color: 'red' }}
            secureTextEntry
            errorMessage={this.state.passwordError}
          />
          <View style={inputButton}>
            <CustomButton title={i18n.t('LOGIN')} onPress={this.makeLogin} />
          </View>
        </View>
        <View style={flex2} />
      </KeyboardAwareScrollView>
    );
  }
}
