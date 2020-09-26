import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Icon } from 'react-native-elements';

import { APP_THEME, APP_FONTS } from '../../constants';
import LocalizationContext from '../../context/localizationContext';
import { getPicklistValues } from '../../services/describe';

type PicklistPropType = {
  fieldName: string;
  value: string;
  onValueChange(value: string): void;
  disabled?: boolean;
  hideNone?: boolean;
};

function Picklist(props: PicklistPropType) {
  const [options, setOptions] = useState([]);

  const { t } = useContext(LocalizationContext);

  /** NOTICE: Don't use 'undefined', use 'null' for blank value
   * @see https://github.com/lawnstarter/react-native-picker-select/issues/40
   */
  const none = {
    label: '-- None --',
    value: null,
  };

  useEffect(() => {
    const setPicklistValues = async () => {
      const options = await getPicklistValues(props.fieldName);
      setOptions([none, ...options]); // TODO: avoid repeat query
    };
    setPicklistValues();
  }, []);

  const { value, onValueChange, disabled, fieldName } = props;

  const displayLabel = () => {
    return t(`'${fieldName}'`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleLabel}>{fieldName}</Text>
      <RNPickerSelect
        disabled={disabled}
        value={value}
        items={options}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
        placeholder={{}}
        Icon={() => {
          return <Icon name="chevron-down" type="font-awesome" size={20} color="gray" />;
        }}
        onValueChange={value => {
          onValueChange(value);
        }}
      />
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: APP_THEME.APP_BORDER_COLOR,
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 10,
    right: 5,
  },
});

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '100%',
  },
  titleLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  placeholderLabel: {
    flex: 1,
    fontSize: 16,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});

export { Picklist };
