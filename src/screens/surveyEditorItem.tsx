import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { memo } from 'react-tracked';
import { TextInput, CheckboxButton, DatePicker, Picklist } from '../components/surveyEditor';

import { useSelector, useDispatch } from '../state/surveyEditorState';
import SurveyEditor from './surveyEditor';

type SurveyItemProps = {
  item: any;
};

type SurveyItemContentProps = {
  item: any;
  onValueChange(value: any): void;
};

function SurveyEditorItem(props: SurveyItemProps) {
  const { item } = props;
  const value = useSelector(state => (state.survey ? state.survey[item.name] : undefined));
  const dispatchSurvey = useDispatch();

  useEffect(() => {
    console.log(`Rendering editor item ${item.label}`);
  });

  const onValueChange = value => {
    dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value } });
  };

  const SurveyEditorItemContent = (props: SurveyItemContentProps) => {
    switch (item.type) {
      case 'string':
        return <TextInput title={item.label} onValueChange={onValueChange} value={value} />;
      case 'textarea':
        return <TextInput title={item.label} onValueChange={onValueChange} value={value} multiline />;
      case 'double':
        return <TextInput title={item.label} onValueChange={onValueChange} value={value} keyboardType="numeric" />;
      case 'boolean':
        return (
          <CheckboxButton
            title={item.label}
            onPress={() => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value: !value } })}
            selected={value}
          />
        );
      case 'date':
        return <DatePicker title={item.label} onValueChange={onValueChange} value={value} />;
      case 'picklist':
        return <Picklist onValueChange={onValueChange} value={value} fieldName={item.name} />;
      case 'phone':
        return <TextInput title={item.label} onValueChange={onValueChange} value={value} keyboardType="phone-pad" />;
      default:
        return (
          <Text>
            {item.label} ({item.type})
          </Text>
        );
    }
  };

  return (
    <View
      style={{
        // flex: 1,
        alignItems: 'flex-start',
        backgroundColor: 'white',
      }}
    >
      <SurveyEditorItemContent item={item} onValueChange={onValueChange} />
    </View>
  );
}

export default memo(SurveyEditorItem);
