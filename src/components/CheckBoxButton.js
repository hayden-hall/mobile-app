import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../constants';

const CheckBoxButton = props => {
  const { title, onPress, selected, disabled } = props;
  return (
    <TouchableOpacity
      style={styles.containerStyle}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon
        name={selected ? 'check-box' : 'check-box-outline-blank'}
        size={30}
        color={APP_THEME.APP_BASE_COLOR}
        type="material"
      />
      <Text style={styles.labelStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    fontSize: 14,
    paddingLeft: 5,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD
  },
  containerStyle: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export { CheckBoxButton };
