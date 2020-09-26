import React, { useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TextInput, CheckboxButton, DatePicker, Picklist } from '../components/surveyEditor';

import { SurveyAction } from '../reducers/surveyReducer';
import SurveyContext from '../context/surveyContext';

type SurveyItemProps = {
  item: any;
};

type SurveyContextProps = {
  survey: any;
  dispatchSurvey: React.Dispatch<SurveyAction>;
};

export default function SurveyItem(props: SurveyItemProps) {
  const { survey, dispatchSurvey }: SurveyContextProps = useContext(SurveyContext);
  const { item } = props;

  const renderItem = () => {
    switch (item.type) {
      case 'string':
        return (
          <TextInput
            title={item.label}
            onValueChange={value => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value } })}
            value={survey[item.name]}
          />
        );
      case 'textarea':
        return (
          <TextInput
            title={item.label}
            onValueChange={value => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value } })}
            value={survey[item.name]}
            multiline
          />
        );
      case 'double':
        return (
          <TextInput
            title={item.label}
            onValueChange={value => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value } })}
            value={survey[item.name]}
            keyboardType="numeric"
          />
        );
      case 'boolean':
        return (
          <CheckboxButton
            title={item.label}
            onPress={() => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value: !survey[item.name] } })}
            selected={survey[item.name]}
          />
        );
      case 'date':
        return (
          <DatePicker
            title={item.label}
            onValueChange={date => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value: date } })}
            value={survey[item.name]}
          />
        );
      case 'picklist':
        return (
          <Picklist
            onValueChange={value => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value } })}
            value={survey[item.name]}
            fieldName={item.name}
          />
        );
      case 'phone':
        return (
          <TextInput
            title={item.label}
            onValueChange={value => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value } })}
            value={survey[item.name]}
            keyboardType="phone-pad"
          />
        );
      default:
        return (
          <Text>
            {item.label} ({item.type})
          </Text>
        );
    }
  };

  return <View style={styles.innerContainer}>{renderItem()}</View>;
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
});
