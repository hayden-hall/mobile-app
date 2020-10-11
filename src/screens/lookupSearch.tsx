import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { Input } from 'react-native-elements';
import Constants from 'expo-constants';
import { APP_THEME } from '../constants';

type LookupProps = {
  navigation: any;
  title: string;
};

export default function LookupSearch({ navigation, title }: LookupProps) {
  return (
    <SafeAreaView style={{ paddingTop: Constants.statusBarHeight }}>
      <View>
        <Button onPress={() => navigation.goBack()} title="Cancel" />
        <Text>{title}</Text>
      </View>
      <View>
        <Input
          placeholder={`Search ${title}`}
          rightIcon={{ name: 'search', color: APP_THEME.APP_LIGHT_FONT_COLOR }}
        />
      </View>
      <View>
        <Text>Awesome lookup search result coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
