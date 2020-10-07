import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
// component
import SurveyEditorItem from './surveyEditorItem';
// state
import LocalizationContext from '../context/localizationContext';
import { useSelector, useDispatch } from '../state/surveyEditorState';
// services
import { createLocalSurvey } from '../services/survey';
import { notifySuccess } from '../utility/notification';
import { getRecords } from '../services/database';
import { buildLayoutDetail } from '../services/describe';
// constatns
import { APP_THEME, APP_FONTS, DB_TABLE } from '../constants';
// types
import { SurveyLayout } from '../types/survey';
import { Survey, RecordType } from '../types/sqlite';
import { StackParamList } from '../router';
type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type SurveyEditorRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type Props = {
  route: SurveyEditorRouteProp;
  navigation: SurveyEditorNavigationProp;
};

export default function SurveyEditorContent({ route, navigation }: Props) {
  const [layout, setLayout] = useState<SurveyLayout>({});
  const [doneButtonDisabled, setDoneButtonDisabled] = useState(false);
  const survey = useSelector(state => state.survey);
  const dispatchSurvey = useDispatch();

  const { t } = useContext(LocalizationContext);

  const editorMode = route.params.localId ? 'EDIT' : 'NEW';

  useEffect(() => {
    setDoneButtonDisabled(true);
    const fetch = async () => {
      if (editorMode === 'NEW') {
        const result = await buildLayoutDetail(route.params.selectedLayoutId);
        setLayout(result);
      } else if (editorMode === 'EDIT') {
        const storedSurveys: Array<Survey> = await getRecords(
          DB_TABLE.SURVEY,
          `where localId ='${route.params.localId}'`
        );
        const storedRecordTypes: Array<RecordType> = await getRecords(
          DB_TABLE.RecordType,
          `where recordTypeId ='${storedSurveys[0].RecordTypeId}'`
        );
        dispatchSurvey({ type: 'LOAD', detail: storedSurveys[0] });
        const result = await buildLayoutDetail(storedRecordTypes[0].layoutId);
        setLayout(result);
      }
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
      survey &&
      survey.syncStatus === 'Unsynced' && (
        <Button
          onPress={async () => {
            setDoneButtonDisabled(true);
            // new or update
            const recordTypeId = route.params.selectedRecordTypeId || survey.recordTypeId;
            const record = { ...survey, RecordTypeId: recordTypeId };
            await createLocalSurvey(record);
            notifySuccess('Created a new survey!');
            navigation.navigate('SurveyList');
          }}
          disabled={doneButtonDisabled}
          title="Save"
        />
      )
    );
  };

  return (
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
