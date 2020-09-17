import React, { useState, useEffect } from 'react';
import { View, FlatList, ImageBackground } from 'react-native';
import { Divider } from 'react-native-elements';

import { getAllRecordTypes } from '../services/describe';
import { ListItem } from '../components';

import {
  APP_THEME,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
} from '../constants';
import { logger } from '../utility/logger';

export default function SurveyTypePicker({ navigation }) {
  const [recordTypes, setRecordTypes] = useState([]);
  const [selectedRecordTypeId, setSelectedRecordTypeId] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const result = await getAllRecordTypes();
      setRecordTypes(result);
    };
    fetch();
  }, []);

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE_SOURCE}
      style={BACKGROUND_STYLE}
      imageStyle={BACKGROUND_IMAGE_STYLE}
    >
      <View>
        <FlatList
          data={recordTypes}
          renderItem={({ item }) => (
            <ListItem
              key={item.name}
              title={item.label}
              onPress={() => {
                setSelectedRecordTypeId(item.recordTypeId);
                logger('DEBUG', 'SurveyTypePicker', item.recordTypeId);
              }}
            />
          )}
          ItemSeparatorComponent={() => (
            <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />
          )}
        />
      </View>
    </ImageBackground>
  );
}
