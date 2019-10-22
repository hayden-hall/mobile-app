import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Picker } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../constants';
import { labels } from '../stringConstants';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { formatDate } from '../utility';

const styles = StyleSheet.create({
  container: { padding: 10 },
  titleLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD
  },
  innerContainer: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    alignItems: 'center',
    paddingLeft: 10,
    width: '100%'
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  valueLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR
  },
  iconView: {
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  placeholderLabel: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR
  }
});

class DatePicker extends PureComponent {
  state = {
    isToolTipVisible: false
  };

  closeToolTip() {
    this.setState({ isToolTipVisible: false });
  }

  hideDateTimePicker = () => {
    this.setState({ isToolTipVisible: false });
  };

  handleDatePicked = date => {
    console.log('A date has been picked: ', date);
    const { onValueChange } = this.props;
    onValueChange(date);
    this.hideDateTimePicker();
  };

  render = () => {
    const {
      container,
      titleLabel,
      innerContainer,
      buttonStyle,
      valueLabel,
      iconView,
      placeholderLabel
    } = styles;
    const { title, value, disabled } = this.props;
    return (
      <View style={container}>
        <Text style={titleLabel}>{title}</Text>
        <View style={innerContainer}>
          <TouchableOpacity
            style={buttonStyle}
            disabled={disabled}
            onPress={() => {
              this.setState({ isToolTipVisible: true });
            }}
          >
            <Text style={value ? valueLabel : placeholderLabel}>
              {value ? formatDate(value) : labels.SELECT}
            </Text>
            <View style={iconView}>
              <Icon
                name="calendar"
                size={18}
                color={APP_THEME.APP_BASE_FONT_COLOR}
                type="antdesign"
              />
            </View>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          confirmTextIOS={labels.CONFIRM}
          cancelTextIOS={labels.CANCEL}
          titleIOS={title}
          titleStyle={titleLabel}
          date={value ? new Date(value) : undefined}
          isVisible={this.state.isToolTipVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
        />
      </View>
    );
  };
}

export { DatePicker };
