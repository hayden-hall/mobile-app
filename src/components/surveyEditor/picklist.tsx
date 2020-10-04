import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { APP_THEME, APP_FONTS, L10N_PREFIX } from '../../constants';
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

  useEffect(() => {
    const setPicklistValues = async () => {
      const options = await getPicklistValues(props.fieldName);
      setOptions(options.map(o => ({ label: o.label, value: o.value }))); // TODO: avoid repeat query
    };
    setPicklistValues();
  }, []);

  const { value, onValueChange, disabled, fieldName } = props;

  const displayLabel = () => {
    return t(`${L10N_PREFIX.PageLayoutItem}${fieldName}`);
  };

  return (
    <View
      style={{
        padding: 10,
        width: '100%',
      }}
    >
      <Text style={styles.titleLabel}>{displayLabel()}</Text>
      <DropDownPicker
        disabled={disabled}
        defaultValue={value}
        items={options}
        // style={{ backgroundColor: '#FFF' }}
        // dropDownStyle={{ backgroundColor: '#FFF' }}
        //placeholder={{}}
        onChangeItem={item => {
          onValueChange(item.value);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
