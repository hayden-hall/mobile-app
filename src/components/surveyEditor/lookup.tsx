import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../../constants';

type LookupPropType = {
  title: string;
  navigation: any;
};

function Lookup({ title, navigation }: LookupPropType) {
  return (
    <View style={{ paddingBottom: 8, width: '100%' }}>
      <Text style={styles.labelStyle}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Lookup', { title })}>
        <Input
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
