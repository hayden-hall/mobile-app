import React, { memo, useEffect } from 'react';
import { Text, View } from 'react-native';
import { TextInput, CheckboxButton, DatePicker, Picklist } from '../components/surveyEditor';

import { useSelector, useDispatch } from '../state/surveyEditorState';

type SurveyItemProps = {
  title: string;
  name: string;
  type: string;
};

function SurveyEditorItem({ title, name, type }: SurveyItemProps) {
  const value = useSelector(state => state.survey[name]);
  const disabled = useSelector(state => state.survey.disabled);
  const dispatchSurvey = useDispatch();

  useEffect(() => {
    console.log(`Rendering editor item ${title}`);
  });

  const onValueChange = value => {
    dispatchSurvey({ type: 'UPDATE', field: { name: name, value } });
  };

  const renderItem = () => {
    switch (type) {
      case 'string':
        return <TextInput title={title} onValueChange={onValueChange} value={value} disabled={disabled} />;
      case 'textarea':
        return <TextInput title={title} onValueChange={onValueChange} value={value} multiline={disabled} />;
      case 'double':
        return (
          <TextInput
            title={title}
            onValueChange={onValueChange}
            value={value}
            keyboardType="numeric"
            disabled={disabled}
          />
        );
      case 'boolean':
        return (
          <CheckboxButton
            title={title}
            onPress={() => dispatchSurvey({ type: 'UPDATE', field: { name: name, value: !value } })}
            selected={value}
          />
        );
      case 'date':
        return <DatePicker title={title} onValueChange={onValueChange} value={value} />;
      case 'picklist':
        return <Picklist onValueChange={onValueChange} value={value} fieldName={name} disabled={disabled} />;
      case 'phone':
        return <TextInput title={title} onValueChange={onValueChange} value={value} keyboardType="phone-pad" />;
      default:
        return (
          <Text>
            {title} ({type})
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
      {renderItem()}
    </View>
  );
}

export default memo(SurveyEditorItem);
