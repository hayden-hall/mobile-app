import React, { PureComponent } from 'react';
import { AppState, AsyncStorage } from 'react-native';
import Storage from 'react-native-storage';
import { ASYNC_STORAGE_KEYS } from './src/constants';
import { labels } from './src/stringConstants';
import { openDatabase, closeDatabase } from './src/services/Database';
import Router from './src/Router';

export default class App extends PureComponent {
  state = {
    appState: AppState.currentState,
    isDatabaseReady: false,
    isLocalizationReady: false
  };

  componentDidMount = async () => {
    console.disableYellowBox = true;
    this.appIsNowRunningInForeground();
    this.setState({
      appState: 'active'
    });
    // Listen for app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
    this.initializeStorage();
    this.setLanguage();
  };

  initializeStorage = () => {
    if(!global.storage) {
      global.storage = new Storage({
          size: 1000,
          storageBackend: AsyncStorage,
          defaultExpires: 1000 * 3600 * 24,
          enableCache: true
      });    
    }
  };

  setLanguage = async () => {
    const languageCode = await storage.load({
      key: ASYNC_STORAGE_KEYS.LANGUAGE
    });
    if (languageCode) {
      labels.setLanguage(languageCode);
    } else {
      labels.setLanguage('en-US');
      await storage.save({
        key: ASYNC_STORAGE_KEYS.LANGUAGE,
        data: 'en-US'
      });
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
    if (this.state.isDatabaseReady && this.state.isLocalizationReady) {
      return <Router />;
    }
    return null;
  }
}
