import React, { PureComponent } from 'react';
//import Survey from './src/screens/Survey';
import { AppState } from 'react-native';
import Router from './Router';
import { openDatabase, closeDatabase } from './src/services/Database';
import AsyncStorage from '@react-native-community/async-storage';
import { ASYNC_STORAGE_KEYS } from './src/constants';
import { labels } from './src/stringConstants';

export default class App extends PureComponent {
  state = {
    appState: AppState.currentState,
    databaseIsReady: false,
    localizationReady: false
  };

  componentDidMount = async () => {
    console.disableYellowBox = true;
    this.appIsNowRunningInForeground();
    this.setState({
      appState: 'active'
    });
    // Listen for app state changes
    AppState.addEventListener('change', this.handleAppStateChange);

    this.setLanguage();
  };

  setLanguage = async () => {
    const languageCode = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.LANGUAGE
    );
    if (languageCode) {
      labels.setLanguage(languageCode);
    } else {
      labels.setLanguage('en-US');
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LANGUAGE, 'en-US');
    }
    this.setState({ localizationReady: true });
  };

  componentWillUnmount = () => {
    // Remove app state change listener
    AppState.removeEventListener('change', this.handleAppStateChange);
  };

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has moved from the background (or inactive) into the foreground
      this.appIsNowRunningInForeground();
    } else if (
      this.state.appState === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has moved from the foreground into the background (or become inactive)
      this.appHasGoneToTheBackground();
    }
    this.setState({ appState: nextAppState });
  };

  appIsNowRunningInForeground = async () => {
    console.log('App is now running in the foreground!');
    await openDatabase();
    this.setState({
      databaseIsReady: true
    });
  };

  appHasGoneToTheBackground = () => {
    console.log('App has gone to the background.');
    closeDatabase();
  };

  render() {
    if (this.state.databaseIsReady && this.state.localizationReady) {
      return <Router />;
    }
    return null;
  }
}
