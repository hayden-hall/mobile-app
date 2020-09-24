import React, { useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { CheckBoxButton } from '../components';

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
      case 'boolean':
        return (
          <CheckBoxButton
            title={item.label}
            onPress={() => dispatchSurvey({ type: 'UPDATE', field: { name: item.name, value: !survey[item.name] } })}
            selected={survey[item.name]}
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
