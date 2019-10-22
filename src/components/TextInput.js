import React, { PureComponent } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../constants';

const styles = StyleSheet.create({
  inputContainerStyle: {
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: APP_THEME.APP_BORDER_COLOR
  },
  labelStyle: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR
  },
  secureIconStyle: {
    alignSelf: 'flex-end',
    marginRight: 10
  },
  inputStyle: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR
  },
  inputStyleMultiline: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
    height: 100
  },
  containerStyle: { padding: 10 }
});

class TextInput extends PureComponent {
  state = {
    showHidePassword: true
  };
  textField = null;
  toggleShowHidePassword = () => {
    this.setState({
      showHidePassword: !this.state.showHidePassword
    });
  };

  render() {
    const {
      placeholder,
      secureTextEntry,
      onChangeText,
      value,
      label,
      errorMessage,
      keyboardType,
      multiline,
      disabled
    } = this.props;
    const { showHidePassword } = this.state;
    const {
      containerStyle,
      inputContainerStyle,
      secureIconStyle,
      labelStyle,
      inputStyle,
      inputStyleMultiline
    } = styles;
    return (
      <Input
        editable={!disabled}
        ref={ref => (this.textField = ref)}
        multiline={multiline ? multiline : false}
        numberOfLines={multiline ? 4 : 1}
        value={value}
        label={label}
        autoCapitalize="none"
        onChangeText={onChangeText}
        keyboardType={keyboardType ? keyboardType : 'default'}
        placeholder={placeholder}
        errorStyle={{ color: APP_THEME.APP_ERROR_COLOR }}
        errorMessage={errorMessage}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        secureTextEntry={secureTextEntry ? showHidePassword : false}
        labelStyle={labelStyle}
        inputStyle={multiline ? inputStyleMultiline : inputStyle}
        rightIcon={
          secureTextEntry && (
            <Icon
              iconStyle={secureIconStyle}
              name="eye"
              size={22}
              color={APP_THEME.APP_BASE_FONT_COLOR}
              type="simple-line-icon"
              onPress={() => this.toggleShowHidePassword()}
            />
          )
        }
      />
    );
  }
}

export { TextInput };
