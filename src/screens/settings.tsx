import React, { useContext } from 'react';
import { View, FlatList, ImageBackground } from 'react-native';
import { Card, Icon, Divider, ListItem } from 'react-native-elements';

import LocalizationContext from '../context/localizationContext';
import {
  APP_THEME,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  APP_FONTS,
} from '../constants';
import { logger } from '../utility/logger';

type Language = {
  name: string;
  code: string;
};

export default function Settings() {
  const { t, locale, setLocale } = useContext(LocalizationContext);

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
          <ListItem.Title style={{ fontFamily: APP_FONTS.FONT_REGULAR }}>
            {item.name}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE_SOURCE}
      style={BACKGROUND_STYLE}
      imageStyle={BACKGROUND_IMAGE_STYLE}
    >
      <Card>
        <Card.Title>{t('LANGUAGE')}</Card.Title>
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
      </Card>
      <Card>
        <Card.Title>{t('SYSTEM')}</Card.Title>
        <ListItem
          onPress={() => {
            console.log('refreshing...');
          }}
          topDivider
          bottomDivider
        >
          <Icon name="cloud-download" color={APP_THEME.APP_LIGHT_FONT_COLOR} />
          <ListItem.Content>
            <ListItem.Title>Reload Metadata</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </Card>
    </ImageBackground>
  );
}
