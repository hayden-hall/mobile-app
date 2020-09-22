import React, { useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Icon, Divider, ListItem } from 'react-native-elements';

import LocalizationContext from '../context/localizationContext';
import { APP_THEME } from '../constants';
import { logger } from '../utility/logger';

type Language = {
  name: string;
  code: string;
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});

export default function Settings() {
  const { locale, setLocale } = useContext(LocalizationContext);

  const languages: Array<Language> = [
    { name: 'English', code: 'en' },
    { name: 'Nepali', code: 'ne' },
  ];

  const renderItem = ({ item }) => {
    return (
      <ListItem
        onPress={() => {
          setLocale(item.code);
          logger('FINE', 'Settings', `change locale to: ${item.code}`);
        }}
      >
        {item.code === locale && <Icon name="check" size={20} color={APP_THEME.APP_BASE_COLOR} />}
        <ListItem.Content>
          <ListItem.Title>{item.name}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <View style={styles.flex1}>
      <FlatList
        data={languages}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
        ItemSeparatorComponent={() => {
          return <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />;
        }}
      />
    </View>
  );
}
