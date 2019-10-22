import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import Popover from 'react-native-popover-view';
import { APP_THEME } from '../constants';

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_THEME.APP_WHITE
  }
});

class ToolTip extends PureComponent {
  render() {
    const { isVisible, onRequestClose, children, fromView } = this.props;
    return (
      <Popover
        isVisible={isVisible}
        onRequestClose={onRequestClose}
        fromView={fromView}
      >
        {children}
      </Popover>
    );
  }
}

export { ToolTip };
