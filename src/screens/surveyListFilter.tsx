import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ButtonGroup } from 'react-native-elements';

import { APP_FONTS, APP_THEME } from '../constants';
import i18n from '../config/i18n';
import { SurveyFilterAction } from '../reducers/surveyFilterReducer';

type FilterButtonGroupProps = {
  dispatch: React.Dispatch<SurveyFilterAction>;
};

export default function FilterButtonGroup(props: FilterButtonGroupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const buttons = [i18n.t('UNSYNCED'), i18n.t('SYNCED'), i18n.t('ALL')];

  return (
    <ButtonGroup
      onPress={index => {
        setSelectedIndex(index);
        if (index === 0) {
          props.dispatch({ type: 'SHOW_UNSYNCED' });
        } else if (index === 1) {
          props.dispatch({ type: 'SHOW_SYNCED' });
        } else {
          props.dispatch({ type: 'SHOW_SYNCED' });
        }
      }}
      selectedIndex={selectedIndex}
      buttons={buttons}
      textStyle={styles.textStyleFilterButton}
      selectedButtonStyle={styles.selectedFilterButtonStyle}
    />
  );
}

const styles = StyleSheet.create({
  textStyleFilterButton: {
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  selectedFilterButtonStyle: {
    backgroundColor: APP_THEME.APP_BASE_COLOR,
  },
});
