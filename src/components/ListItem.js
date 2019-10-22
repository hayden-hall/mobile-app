import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TextHeading } from './TextHeading';
import { TextSubheading } from './TextSubheading';
import { APP_THEME } from '../constants';

class ListItem extends PureComponent {
  render = () => {
    const { innerContainer, row } = styles;
    const { title, subtitle, onPress, showCaret } = this.props;
    return (
      <TouchableOpacity style={row} onPress={onPress}>
        <View style={innerContainer}>
          <TextHeading>{title}</TextHeading>
          {subtitle && <TextSubheading>{subtitle}</TextSubheading>}
        </View>
        {showCaret && <View style={styles.triangleCorner} />}
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  innerContainer: {
    marginLeft: 20,
    flex: 1,
    justifyContent: 'space-around'
  },
  row: { minHeight: 44 },
  triangleCorner: {
    width: 0,
    height: 0,
    position: 'absolute',
    right: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 15,
    borderTopWidth: 15,
    borderRadius: 3,
    borderRightColor: 'transparent',
    borderTopColor: APP_THEME.APP_BASE_COLOR,
    transform: [{ rotate: '90deg' }]
  }
});

export { ListItem };
