import React, { useState, useReducer, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon, Divider } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import NetInfo from '@react-native-community/netinfo';
import { StackNavigationProp } from '@react-navigation/stack';
// components
import { SearchBar, ListItem, Loader } from '../components';
import FilterButtonGroup from './surveyListFilter';
import SurveyListHeader from './surveyListHeader';
// services
import { getAllSurveys, getOfflineCreatedSurvey } from '../services/api/salesforce/Survey';
// import { refreshAll } from '../services/Refresh';
import { buildRecordTypeDictionary } from '../services/describe';
// store
import { surveyFilterReducer } from '../reducers/surveyFilterReducer';
import { surveyListReducer } from '../reducers/surveyListReducer';
import SurveyListContext from '../context/surveyListContext';
import LocalizationContext from '../context/localizationContext';
// util, constants
import { formatDate } from '../utility';
import { logger } from '../utility/logger';
import { APP_FONTS, APP_THEME } from '../constants';
// types
import { StackParamList } from '../router';
type SurveyTypePickerNavigationProp = StackNavigationProp<StackParamList, 'SurveyList'>;

type Props = {
  navigation: SurveyTypePickerNavigationProp;
};
// TODO: navigate to login screen when session timeout

export default function SurveyList({ navigation }) {
  const [surveys, dispatchSurveys] = useReducer(surveyListReducer, []);
  const [filter, dispatchFilter] = useReducer(surveyFilterReducer, 'SHOW_UNSYNCED');

  const [searchTerm, setSearchTerm] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);

  const { t } = useContext(LocalizationContext);

  /**
   * @description Initialization. Subscribe NetInfo and retrieve all surveys from local database.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      logger('INFO', 'SurveyList', `Connection type: ${state.type}`);
      logger('INFO', 'SurveyList', `Is connected? ${state.isConnected}`);
      setIsNetworkConnected(state.isConnected);
    });
    setShowsSpinner(true);
    const build = async () => {
      await buildRecordTypeDictionary();
    };
    build();
    getAllSurveys()
      .then(response => {
        dispatchSurveys({
          type: 'INITIALIZE',
          surveys: response,
        });
      })
      .finally(() => {
        setShowsSpinner(false);
      });
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * @description Filter surveys by button selection, and then by search term.
   */
  const filteredSurveys = surveys
    .filter(survey => {
      if (filter === 'SHOW_UNSYNCED' && survey.IsLocallyCreated === 1) return true;
      if (filter === 'SHOW_SYNCED' && survey.IsLocallyCreated === 0) return true;
      if (filter === 'SHOW_ALL') return true;
      return false;
    })
    .filter(survey => {
      return survey.Survey_Heading.includes(searchTerm);
    })
    .map(object => {
      return {
        ...object,
        subtitle: `${object.Survey_Type} • ${formatDate(object.Visit_Clinic_Date__c)}`,
        showCaret: object.IsLocallyCreated !== 0,
      };
    });

  const newSurveyButton = () => {
    return (
      <View style={styles.addButtonStyle}>
        <Icon
          reverse
          raised
          name="md-add"
          type="ionicon"
          size={22}
          color={APP_THEME.APP_BASE_FONT_COLOR}
          onPress={() => {
            navigation.navigate('SurveyTypePicker');
          }}
        />
      </View>
    );
  };

  const { flex1, textStyleTotalSurvey } = styles;

  const keyExtractor = (item, index) => index.toString();

  const renderItem = data => {
    return (
      <ListItem
        title={data.item.Survey_Heading}
        subtitle={data.item.subtitle}
        onPress={() => {
          // onPress && onPress(data.item);
        }}
        showCaret={data.item.showCaret}
      />
    );
  };

  return (
    <SurveyListContext.Provider value={dispatchSurveys}>
      <Loader loading={showsSpinner} />
      <View style={flex1}>
        <SearchBar
          placeholder={t('SEARCH_SURVEYS')}
          value={searchTerm}
          onChangeText={searchTerm => setSearchTerm(searchTerm)}
        />
        <SurveyListHeader isNetworkConnected={isNetworkConnected} surveys={surveys} />
        <Text style={textStyleTotalSurvey}>{`${t('TOTAL_SURVEYS')} ${surveys.length}`}</Text>
        <FilterButtonGroup dispatch={dispatchFilter} />
        <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />
        <SwipeListView
          data={filteredSurveys}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={() => {
            return <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />;
          }}
          renderHiddenItem={(data, rowMap) =>
            data.item.IsLocallyCreated ? (
              <View style={styles.rowBack}>
                <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => this.showDeleteConfirmAlert(rowMap, data.item, data.index)}
                >
                  <Text style={styles.backTextWhite}>{t('DELETE')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.rowBack}>
                <TouchableOpacity style={[styles.backRightBtn, styles.backDisabledRightBtnRight]}>
                  <Text style={styles.backTextWhite}>{t('DELETE')}</Text>
                </TouchableOpacity>
              </View>
            )
          }
          disableRightSwipe
          rightOpenValue={-75}
        />
        {newSurveyButton()}
      </View>
    </SurveyListContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
    backgroundColor: 'white',
  },
  textStyleTotalSurvey: {
    paddingLeft: 10,
    paddingBottom: 5,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    backgroundColor: 'white',
  },
  addButtonStyle: { position: 'absolute', bottom: 30, right: 30 },
  backTextWhite: {
    color: '#FFF',
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#c23934',
    right: 0,
  },
  backDisabledRightBtnRight: {
    backgroundColor: '#c9c7c5',
    right: 0,
  },
});

/**
 * <SelectionList
        data={surveys}
        titleKey="Survey_Heading"
        hideSearchBar
        subtitleKey="subtitle"
        searchTxt={searchTerm}
        searchBarLabel={i18n.t('SEARCH_SURVEYS')}
        onPress={async item => {
          const createdSurvey = await getOfflineCreatedSurvey(item);
          const LocalId = item.LocalId;
          const IsLocallyCreated = item.IsLocallyCreated;
          navigation.push('Survey', {
            createdSurvey,
            LocalId,
            IsLocallyCreated,
            headerTitle: i18n.t('SURVEY_DETAIL'),
          });
        }}
      />
 */

/*
    const onSurveyDeleted = async item => {
    const remainingSurveys = this.state.filteredSurveys.filter(
      survey => survey.LocalId !== item.LocalId
    );
    this.prepareListdata(remainingSurveys);
  };
*/
