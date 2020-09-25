import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-community/picker';
import { Icon } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../../constants';
import { ToolTip } from '../ToolTip';
import LocalizationContext from '../../context/localizationContext';
import { getPicklistValues } from '../../services/describe';

type PicklistPropType = {
  fieldName: string;
  title: string;
  value: string;
  onValueChange(value: string): void;
  disabled?: boolean;
  hideNone?: boolean;
};

function Picklist(props: PicklistPropType) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [options, setOptions] = useState([]);

  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const setPicklistValues = async () => {
      const options = await getPicklistValues(props.fieldName);
      setOptions(options); // TODO: avoid repeat query
    };
    setPicklistValues();
  }, []);

  const closeTooltip = () => {
    setIsTooltipVisible(false);
  };

  const { value, onValueChange, disabled, hideNone, title } = props;

  const renderPicklistValues = () => {
    return (
      <View style={styles.container}>
        <Picker
          enabled={!disabled}
          pointerEvents={disabled ? 'none' : 'auto'}
          mode="dropdown"
          selectedValue={value}
          style={{ height: 200, width: 300 }}
          onValueChange={itemValue => {
            closeTooltip();
            onValueChange(itemValue.toString());
          }}
        >
          {options.map(option => (
            <Picker.Item label={option.label} value={option.value} key={option.value} />
          ))}
        </Picker>
      </View>
    );
  };

  const renderAndroidPicker = () => {
    const pickerItems = [
      hideNone ? [] : <Picker.Item label={'--none--'} value={undefined} key={0} />,
      options.map(i => <Picker.Item label={i.toString()} value={i} key={i} />),
    ];

    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => {
          setIsTooltipVisible(true);
        }}
      >
        <Picker
          enabled={!disabled}
          selectedValue={value}
          style={{ width: '100%' }}
          onValueChange={itemValue => {
            closeTooltip();
            onValueChange(itemValue.toString());
          }}
        >
          {pickerItems}
        </Picker>
      </TouchableOpacity>
    );
  };

  const renderiOSPicker = () => {
    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        disabled={disabled}
        onPress={() => {
          setIsTooltipVisible(true);
        }}
      >
        <Text style={value ? styles.valueLabel : styles.placeholderLabel}>{value || t('SELECT')}</Text>
        <View style={styles.iconView}>
          <Icon name="caretdown" size={18} color={APP_THEME.APP_BASE_FONT_COLOR} type="antdesign" />
        </View>
        <ToolTip
          isVisible={isTooltipVisible}
          onRequestClose={() => {
            closeTooltip();
          }}
        >
          {renderPicklistValues()}
        </ToolTip>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleLabel}>{title}</Text>
      <View style={styles.innerContainer}>
        <View style={styles.container}>
          <Picker
            enabled={!disabled}
            pointerEvents={disabled ? 'none' : 'auto'}
            mode="dropdown"
            selectedValue={value}
            style={{ height: 200, width: 300 }}
            onValueChange={itemValue => {
              closeTooltip();
              onValueChange(itemValue.toString());
            }}
          >
            {options.map(option => (
              <Picker.Item label={option.label} value={option.value} key={option.value} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  titleLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  innerContainer: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    alignItems: 'center',
    paddingLeft: 10,
    width: '100%',
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  placeholderLabel: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  iconView: {
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
});

export { Picklist };
