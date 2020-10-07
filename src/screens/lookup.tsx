import React from 'react';
import { Button, View, Text } from 'react-native';

export default function Lookup({ navigation }) {
  return (
    <View>
      <Text>Awesome lookup coming soon</Text>
      <Button onPress={() => navigation.goBack()} title="Cancel" />
    </View>
  );
}
