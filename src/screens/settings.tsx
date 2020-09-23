import React, { useState, useContext } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { Card, Icon, Divider, ListItem } from 'react-native-elements';
import NetInfo from '@react-native-community/netinfo';
import { Loader } from '../components';

import LocalizationContext from '../context/localizationContext';
import { APP_THEME, BACKGROUND_IMAGE_SOURCE, BACKGROUND_STYLE, BACKGROUND_IMAGE_STYLE, APP_FONTS } from '../constants';
import { logger } from '../utility/logger';
import { retrieveAll } from '../services/describe';
import { showMessage } from 'react-native-flash-message';

type Language = {
  name: string;
  code: string;
};

export default function Settings() {
  const [showsSpinner, setShowsSpinner] = useState(false);
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
          <ListItem.Title style={{ fontFamily: APP_FONTS.FONT_REGULAR }}>{item.name}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <Loader loading={showsSpinner} />
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
          onPress={async () => {
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isInternetReachable) {
              showMessage({
                message: 'No network connection. Confirm your network connectivity and try again.',
                type: 'danger',
                icon: {
                  icon: 'danger',
                  position: 'left',
                },
              });
              return;
            }
            setShowsSpinner(true);
            try {
              await retrieveAll();
              showMessage({
                message: 'Successfully refreshed metadata.',
                type: 'success',
                icon: {
                  icon: 'success',
                  position: 'left',
                },
              });
            } catch (e) {
              // TODO: log in again?
            } finally {
              setShowsSpinner(false);
            }
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
