import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Picker,
  Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../constants';
import { ToolTip } from './ToolTip';
import i18n from '../config/i18n';

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
  placeholderLabel: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR
  },
  iconView: {
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center'
  }
});

class Picklist extends PureComponent {
  state = {
    isToolTipVisible: false,
    isAndroid: false
  };

  componentDidMount = () => {
    this.setState({ isAndroid: Platform.OS === 'android' });
  };

  closeToolTip() {
    this.setState({ isToolTipVisible: false });
  }

  _renderPicklistValues = () => {
    const { options, value, onValueChange, disabled, hideNone } = this.props;
    const pickerItems = [
      hideNone ? (
        []
      ) : (
        <Picker.Item label={'--none--'} value={undefined} key={0} />
      ),
      options.map(i => <Picker.Item label={i.toString()} value={i} key={i} />)
    ];
    return (
      <View style={styles.container}>
        <Picker
          enabled={!disabled}
          pointerEvents={disabled ? 'none' : 'auto'}
          mode="dropdown"
          selectedValue={value}
          style={{ height: 200, width: 300 }}
          onValueChange={itemValue => {
            this.closeToolTip();
            onValueChange(itemValue);
          }}
        >
          {pickerItems}
        </Picker>
      </View>
    );
  };

  renderPlatformSpecificPicker = () => {
    const { container, titleLabel, innerContainer } = styles;
    const { title } = this.props;
    return (
      <View style={container}>
        <Text style={titleLabel}>{title}</Text>
        <View style={innerContainer}>
          {this.state.isAndroid
            ? this.renderAndroidPicker()
            : this.renderiOSPicker()}
        </View>
      </View>
    );
  };

  renderAndroidPicker = () => {
    const { buttonStyle } = styles;

    const { options, value, onValueChange, disabled, hideNone } = this.props;
    let pickerItems = [
      hideNone ? (
        []
      ) : (
        <Picker.Item label={'--none--'} value={undefined} key={0} />
      ),
      options.map(i => <Picker.Item label={i.toString()} value={i} key={i} />)
    ];

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={() => {
          this.setState({ isToolTipVisible: true });
        }}
      >
        <Picker
          enabled={!disabled}
          selectedValue={value}
          style={{ width: '100%' }}
          onValueChange={itemValue => {
            this.closeToolTip();
            onValueChange(itemValue);
          }}
        >
          {pickerItems}
        </Picker>
      </TouchableOpacity>
    );
  };

  renderiOSPicker = () => {
    const { buttonStyle, valueLabel, iconView, placeholderLabel } = styles;
    const { value, disabled } = this.props;
    return (
      <TouchableOpacity
        style={buttonStyle}
        disabled={disabled}
        onPress={() => {
          this.setState({ isToolTipVisible: true });
        }}
      >
        <Text style={value ? valueLabel : placeholderLabel}>
          {value || i18n.t('SELECT')}
        </Text>
        <View style={iconView}>
          <Icon
            name="caretdown"
            size={18}
            color={APP_THEME.APP_BASE_FONT_COLOR}
            type="antdesign"
          />
        </View>
        <ToolTip
          isVisible={this.state.isToolTipVisible}
          onRequestClose={() => {
            this.closeToolTip();
          }}
        >
          {this._renderPicklistValues()}
        </ToolTip>
      </TouchableOpacity>
    );
  };

  render = () => {
    return this.renderPlatformSpecificPicker();
  };
}

export { Picklist };
