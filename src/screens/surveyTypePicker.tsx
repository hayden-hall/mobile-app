import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { getAllRecordTypes } from '../services/describe';

export default function SurveyTypePicker({ navigation }) {
  const [recordTypes, setRecordTypes] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const result = await getAllRecordTypes();
      setRecordTypes(result);
    };
    fetch();
  }, []);

  return (
    <View>
      {recordTypes.map(r => {
        return <Text key={r.name}>{r.label}</Text>;
      })}
    </View>
  );
}
