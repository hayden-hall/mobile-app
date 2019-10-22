import React, { PureComponent } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 50,
    marginTop: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    borderRadius: 10,
    elevation: 1
  },
  iconStyle: {
    marginLeft: 12
  },
  secureIconStyle: {
    alignSelf: 'flex-end',
    marginRight: 10
  },
  textInputStyle: {
    flex: 1,
    marginLeft: 12,
    color: '#222222'
  }
});

export default class InputBox extends PureComponent {
  state = {
    showHidePassword: true
  };

  toggleShowHidePassword = () => {
    this.setState({
      showHidePassword: !this.state.showHidePassword
    });
  };

  render() {
    const {
      placeholder,
      iconName,
      type,
      secureTextEntry,
      onChangeText,
      value
    } = this.props;
    const { showHidePassword } = this.state;
    return (
      <View style={styles.container}>
        <Icon
          iconStyle={styles.iconStyle}
          name={iconName}
          size={20}
          color="#111111"
          type={type}
        />
        <TextInput
          style={styles.textInputStyle}
          placeholder={placeholder}
          onChangeText={onChangeText}
          value={value}
          autoCapitalize="none"
          autoCorrect={false}
          {...this.props}
          secureTextEntry={secureTextEntry ? showHidePassword : false}
        />
        {secureTextEntry && (
          <Icon
            iconStyle={styles.secureIconStyle}
            name="eye"
            size={22}
            color="#111111"
            type="simple-line-icon"
            onPress={() => this.toggleShowHidePassword()}
          />
        )}
      </View>
    );
  }
}
