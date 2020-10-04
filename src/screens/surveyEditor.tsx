import React, { useState, useEffect, useReducer, useContext, useLayoutEffect } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';

import { buildLayoutDetail } from '../services/describe';
import { surveyReducer } from '../reducers/surveyReducer';

import { APP_THEME, APP_FONTS } from '../constants';
import { StackParamList } from '../router';
import { SurveyLayout } from '../types/survey';
import SurveyEditorItem from './surveyEditorItem';
import SurveyContext from '../context/surveyContext';
import LocalizationContext from '../context/localizationContext';
import { createLocalSurvey } from '../services/survey';
import { notifySuccess } from '../utility/notification';

type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type SurveyEditorRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type Props = {
  route: SurveyEditorRouteProp;
  navigation: SurveyEditorNavigationProp;
};

export default function SurveyEditor({ route, navigation }: Props) {
  const [layout, setLayout] = useState<SurveyLayout>({});
  const [doneButtonDisabled, setDoneButtonDisabled] = useState(false);
  const [survey, dispatchSurvey] = useReducer(surveyReducer, {});

  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const fetch = async () => {
      const result = await buildLayoutDetail(route.params.selectedLayoutId);
      setLayout(result);
    };
    fetch();
    setDoneButtonDisabled(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => SaveButton(),
    });
  }, [navigation, survey]);

  const SaveButton = () => {
    return (
      <Button
        onPress={async () => {
          setDoneButtonDisabled(true);
          const record = { ...survey, RecordTypeId: route.params.selectedRecordTypeId };
          await createLocalSurvey(record);
          notifySuccess('Created a new survey!');
          navigation.navigate('SurveyList');
        }}
        disabled={doneButtonDisabled}
        title="Done"
      />
    );
  };

  return (
    <SurveyContext.Provider value={{ survey, dispatchSurvey }}>
      <View>
        {layout.sections && (
          <KeyboardAwareSectionList
            sections={layout.sections}
            keyExtractor={item => item.name}
            CellRendererComponent={({ children, index, style, ...props }) => {
              const cellStyle = [style, { zIndex: layout.sections.length - index }];
              return (
                <View style={cellStyle} index={index} {...props}>
                  {children}
                </View>
              );
            }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.headerView}>
                <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
              </View>
            )}
            renderItem={({ item }) => <SurveyEditorItem item={item} />}
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
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 },
});
