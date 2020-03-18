import React, { PureComponent } from 'react';
import * as Font from 'expo-font';
import Router from './src/Router';
import { initializeStorage } from './src/utility';

console.disableYellowBox = true;
initializeStorage();

export default class App extends PureComponent {
  state = {
    fontLoaded: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      'SalesforceSans-Regular': require('./assets/fonts/SalesforceSans-Regular.ttf'),
      'SalesforceSans-Bold': require('./assets/fonts/SalesforceSans-Bold.ttf'),
      'SalesforceSans-Light': require('./assets/fonts/SalesforceSans-Light.ttf'),
    });

    this.setState({
      fontLoaded: true,
    });
  }

  render() {
    return this.state.fontLoaded ? <Router /> : null;
  }
}
