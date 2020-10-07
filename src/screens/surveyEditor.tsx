import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { StackParamList } from '../router';
import { Provider } from '../state/surveyEditorState';
import SurveyEditorContent from './surveyEditorContent';

type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;
type SurveyEditorRouteProp = RouteProp<StackParamList, 'SurveyEditor'>;

type Props = {
  route: SurveyEditorRouteProp;
  navigation: SurveyEditorNavigationProp;
};

export default function SurveyEditor({ route, navigation }: Props) {
  return (
    <Provider>
      <SurveyEditorContent route={route} navigation={navigation} />
    </Provider>
  );
}
