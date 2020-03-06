import React, { PureComponent } from 'react';

import { openDatabase, closeDatabase } from './src/services/Database';
import Router from './src/Router';
import { initializeStorage } from './src/utility'; 

export default class App extends PureComponent {
  state = {
    appState: AppState.currentState,
    isDatabaseReady: false,
  };

  componentDidMount = async () => {
    console.disableYellowBox = true;
    this.appIsNowRunningInForeground();
    this.setState({
      appState: 'active'
    });
    // Listen for app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
    await initializeStorage();
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
    if (this.state.isDatabaseReady) {
      return <Router />;
    }
    return null;
  }
}
