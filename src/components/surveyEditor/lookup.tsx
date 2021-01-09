import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import { getRecords } from '../../services/database';
import { APP_THEME, APP_FONTS, DB_TABLE } from '../../constants';

type LookupPropType = {
  fieldName: string;
  title: string;
  value: string;
  navigation: any;
};

function Lookup({ fieldName, title, value, navigation }: LookupPropType) {
  const [lookupToName, setLookupToName] = useState('');

  useEffect(() => {
    console.log('Lookup item component. Resolving record id to name');
    const load = async () => {
      if (value) {
        const records = await getRecords(DB_TABLE.CONTACT, `where id = '${value}'`);
        setLookupToName(records[0].name);
      } else {
        setLookupToName('');
      }
    };
    load();
  });

  return (
    <View style={{ paddingBottom: 8, width: '100%' }}>
      <Text style={styles.labelStyle}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Lookup', { fieldName, title })}>
        <Input
          value={lookupToName}
          pointerEvents="none"
          inputContainerStyle={styles.inputContainerStyle}
          renderErrorMessage={false}
          rightIcon={{ name: 'search', color: APP_THEME.APP_LIGHT_FONT_COLOR }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  labelStyle: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  inputContainerStyle: {
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
  },
});

export { Lookup };