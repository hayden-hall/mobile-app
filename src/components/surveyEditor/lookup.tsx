import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../../constants';

type LookupPropType = {
  title: string;
  navigation: any;
};

function Lookup({ title, navigation }: LookupPropType) {
  return (
    <View style={{ paddingBottom: 8, width: '100%' }}>
      <Input
        label={title}
        labelStyle={styles.labelStyle}
        inputContainerStyle={styles.inputContainerStyle}
        renderErrorMessage={false}
        onFocus={() => navigation.navigate('Lookup', { title })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelStyle: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  inputContainerStyle: {
    margin: 0,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: APP_THEME.APP_BORDER_COLOR,
  },
});

export { Lookup };
