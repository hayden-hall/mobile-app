import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Icon, Divider, ListItem } from 'react-native-elements';

import i18n from '../config/i18n';
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
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('');

  useEffect(() => {
    logger('DEBUG', 'Settings', `current locale: ${i18n.locale}`);
    setSelectedLanguageCode(i18n.locale);
  }, []);

  const onChoiceChanged = async item => {
    i18n.locale = item.code;
    setSelectedLanguageCode(item.code);
    logger('DEBUG', 'Settings', `change locale to: ${item.code}`);
  };

  const languages: Array<Language> = [
    { name: 'English', code: 'en' },
    { name: 'Nepali', code: 'ne' },
  ];

  const renderItem = ({ item }) => {
    return (
      <ListItem
        onPress={() => {
          onChoiceChanged(item);
        }}
      >
        {() => {
          if (item.code === selectedLanguageCode) {
            return <Icon name="check" size={20} />;
          }
        }}
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
