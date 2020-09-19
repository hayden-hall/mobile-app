import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';

import { getLayoutDetail } from '../services/describe';

import {
  APP_THEME,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
} from '../constants';
import { logger } from '../utility/logger';
import { StackParamList } from '../router';
import { SurveyLayout } from '../types/survey';

type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type SurveyEditorRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type Props = {
  route: SurveyEditorRouteProp;
  navigation: SurveyEditorNavigationProp;
};

export default function SurveyEditor({ route, navigation }: Props) {
  const [layout, setLayout] = useState<SurveyLayout>({});

  useEffect(() => {
    const fetch = async () => {
      const result = await getLayoutDetail(route.params.selectedRecordTypeId);
      setLayout(result);
    };
    fetch();
  }, []);

  return (
    <View>
      {layout.sections.map(s => {
        return (
          <View key={s.id}>
            <Text>s.label</Text>
            <ul>
              {s.items.map(i => {
                <li>{i.label}</li>;
              })}
            </ul>
          </View>
        );
      })}
    </View>
  );
}
