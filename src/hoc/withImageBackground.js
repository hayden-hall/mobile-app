import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Loader } from '../components';

export default WrappedComponent => {
  class withImageBackground extends Component {
    state = {
      isAppLoading: false
    };
    showsSpinner = (showsSpinner) => {
      this.setState({ isAppLoading: showsSpinner });
    };
    render() {
      const { backgroundImage, container } = styles;
      return (
        <View style={container}>
          <Loader loading={this.state.isAppLoading} />
          <Image
            style={backgroundImage}
            source={require('../../assets/images/background.png')}
          />
          <WrappedComponent
            showsSpinner={this.showsSpinner}
            {...this.state}
            {...this.props}
          />
        </View>
      );
    }
  }
  return withImageBackground;
};

const styles = StyleSheet.create({
  backgroundImage: {
    bottom: 0,
    width: '100%',
    zIndex: 0,
    position: 'absolute'
  },
  container: {
    flex: 1
  }
});
