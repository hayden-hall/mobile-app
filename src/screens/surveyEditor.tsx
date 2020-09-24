import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';

import { buildLayoutDetail } from '../services/describe';
import { surveyReducer } from '../reducers/surveyReducer';

import { APP_THEME, APP_FONTS } from '../constants';
import { logger } from '../utility/logger';
import { StackParamList } from '../router';
import { SurveyLayout } from '../types/survey';
import SurveyItem from './surveyItem';
import SurveyContext from '../context/surveyContext';

type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type SurveyEditorRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type Props = {
  route: SurveyEditorRouteProp;
  navigation: SurveyEditorNavigationProp;
};

export default function SurveyEditor({ route, navigation }: Props) {
  const [layout, setLayout] = useState<SurveyLayout>({});
  const [survey, dispatchSurvey] = useReducer(surveyReducer, {});

  const surveyContext = { survey, dispatchSurvey };

  useEffect(() => {
    const fetch = async () => {
      const result = await buildLayoutDetail(route.params.selectedLayoutId);
      setLayout(result);
    };
    fetch();
  }, []);

  return (
    <SurveyContext.Provider value={surveyContext}>
      <View>
        {layout.sections && (
          <SectionList
            sections={layout.sections}
            keyExtractor={item => item.name}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.headerView}>
                <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
              </View>
            )}
            renderItem={({ item }) => <SurveyItem item={item} />}
          />
        )}
      </View>
    </SurveyContext.Provider>
  );
}

const styles = StyleSheet.create({
  headerView: {
    backgroundColor: APP_THEME.APP_LIST_HEADER_COLOR,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 10,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    letterSpacing: 0.42,
    padding: 10,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  flex1: {
    flex: 1,
  },
});
