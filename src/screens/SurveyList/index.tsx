import React, { PureComponent } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TextInput, Text, Modal } from 'react-native';
import i18n from '../../config/i18n';
import { APP_FONTS, APP_THEME, ASYNC_STORAGE_KEYS } from '../../constants';
import { SelectionList, SearchBar } from '../../components';
import { Icon, Divider, Button, ButtonGroup } from 'react-native-elements';
import { getAllSurveys, getOfflineCreatedSurvey } from '../../services/API/Salesforce/Survey';
import NetInfo from '@react-native-community/netinfo';
import { refreshAll } from '../../services/Refresh';
import { formatDate } from '../../utility';
import Login from '../Auth/Login';

interface SurveyListProps {
  navigation: any;
  searchTxt: string;
  showsSpinner: any;
}

export default class SurveyList extends PureComponent<SurveyListProps> {
  _navListener;

  static navigationOptions = {
    title: 'Home',
  };

  state = {
    surveys: [],
    filteredSurveys: [],
    searchTxt: '',
    refreshButtonState: true,
    isNetworkConnected: false,
    dirtySurveyCount: 0,
    showLoginModal: false,
    filteredIndex: 0,
  };

  fetchData = async () => {
    try {
      const surveys = await getAllSurveys();
      await this.setState({ surveys });

      // show unsynced surveys as default
      this.onFilterButtonPressed(this.state.filteredIndex);
    } catch (error) {}
  };

  componentDidMount = () => {
    this._navListener = this.props.navigation.addListener('didFocus', payload => {
      this.fetchData();
    });

    NetInfo.addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      const isNetworkConnected = state.isConnected;
      // @ts-ignore
      storage.save({
        key: ASYNC_STORAGE_KEYS.NETWORK_CONNECTIVITY,
        data: `${isNetworkConnected}`,
      });
      this.setState({ isNetworkConnected });
      this.setRefreshButtonState();
    });
  };

  componentWillUnmount = () => {
    return () => {
      //unsubscribe
      console.log('this.props.navigation.', this.props.navigation);
      this._navListener.remove();
    };
  };

  refreshAppData = async () => {
    try {
      this.props.showsSpinner(true);
      const result = await refreshAll();
      this.fetchData();
      this.props.showsSpinner(false);
    } catch (error) {
      this.props.showsSpinner(false);
      setTimeout(() => {
        if (error === 'Login Failed' || error === 'Session expired or invalid') {
          //Show Login Modal
          this.setState({ showLoginModal: true });
        } else {
          alert(`${error}`);
        }
      }, 500);
    }
  };

  _renderLoginModal = () => {
    return (
      <Modal animationType="slide" visible={this.state.showLoginModal}>
        <View style={{}} />
        <Login
          isLoginModal
          loginSuccessfull={() => {
            this.setState({ showLoginModal: false });
            setTimeout(() => {
              this.refreshAppData();
            }, 500);
          }}
        />
      </Modal>
    );
  };

  prepareListdata = surveys => {
    const filteredSurveys = surveys.map(object => {
      return {
        ...object,
        subtitle: `${object.Survey_Type} • ${formatDate(object.Visit_Clinic_Date__c)}`,
        showCaret: object.IsLocallyCreated !== 0,
      };
    });
    this.setState({ filteredSurveys });
    this.setRefreshButtonState();
  };

  filterSurveysByText = async text => {
    if (this.state.surveys) {
      this.setState({ searchTxt: text });
      const stateFilteredSurveys = await this.filterSurveysByState(this.state.filteredIndex);
      const textFilteredSurveys = stateFilteredSurveys.filter(
        obj =>
          obj.Survey_Heading.includes(text) ||
          obj.Survey_Type.includes(text) ||
          obj.Visit_Clinic_Date__c.includes(text)
      );
      this.prepareListdata(textFilteredSurveys);
    }
  };

  filterSurveysByState = async filteredIndex => {
    const { surveys } = this.state;
    return surveys.filter(survey => {
      // offline
      if (filteredIndex === 0) {
        return survey.IsLocallyCreated !== 0;
        // synced
      } else if (filteredIndex === 1) {
        return survey.IsLocallyCreated === 0;
      } else {
        return survey;
      }
    });
  };

  onFilterButtonPressed = async filteredIndex => {
    if (this.state.surveys) {
      await this.setState({ filteredIndex });
      this.prepareListdata(await this.filterSurveysByState(filteredIndex));
    }
  };

  setRefreshButtonState = () => {
    const { surveys, isNetworkConnected } = this.state;
    const getDirtySurveys = surveys.filter(object => object.IsLocallyCreated);
    const refreshButtonState = isNetworkConnected;
    this.setState({
      refreshButtonState,
      dirtySurveyCount: getDirtySurveys.length,
    });
  };

  showRefreshPopup = () => {
    Alert.alert(
      i18n.t('SYNCING'),
      i18n.t('UPLOAD_SURVEY_MESSAGE'),
      [
        {
          text: i18n.t('OK'),
          onPress: () => {
            //this.props.navigation.pop();
            this.refreshAppData();
          },
        },
        {
          text: i18n.t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  };

  _renderPendingSurveyCount = () => {
    const { dirtySurveyCount, refreshButtonState } = this.state;
    return (
      <View style={styles.pendingSurveyContainer}>
        <TextInput
          underlineColorAndroid="transparent"
          placeholder={i18n.t('SEARCH_SURVEYS')}
          style={styles.textStylePendingSurvey}
          value={`${dirtySurveyCount} - ${i18n.t('QUEUED_FOR_SYNC')}`}
          editable={false}
        />
        <View style={styles.syncIconStyle}>
          <Button
            containerStyle={{ minWidth: 80 }}
            titleStyle={
              refreshButtonState
                ? { color: APP_THEME.APP_WHITE, fontFamily: APP_FONTS.FONT_REGULAR }
                : { color: APP_THEME.APP_DARK_FONT_COLOR, fontFamily: APP_FONTS.FONT_REGULAR }
            }
            buttonStyle={
              refreshButtonState
                ? { backgroundColor: APP_THEME.APP_BASE_COLOR }
                : { backgroundColor: APP_THEME.APP_BORDER_COLOR }
            }
            onPress={() => {
              refreshButtonState && this.showRefreshPopup();
            }}
            title="Sync"
          />
        </View>
      </View>
    );
  };

  _renderSearchBar = () => (
    <SearchBar
      placeholder={i18n.t('SEARCH_SURVEYS')}
      value={this.props.searchTxt}
      onChangeText={searchTxt => this.filterSurveysByText(searchTxt)}
    />
  );

  _renderFilterButtonGroup = () => {
    const buttons = [i18n.t('UNSYNCED'), i18n.t('SYNCED'), i18n.t('ALL')];
    return (
      <ButtonGroup
        onPress={this.onFilterButtonPressed}
        buttons={buttons}
        selectedIndex={this.state.filteredIndex}
        textStyle={styles.textStyleFilterButton}
      />
    );
  };

  _renderNewSurveyButton = () => {
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
            this.props.navigation.push('SurveyPicker', {
              headerTitle: i18n.t('CHOOSE_SURVEY'),
            });
          }}
        />
      </View>
    );
  };

  render() {
    const { flex1, textStyleTotalSurvey } = styles;
    return this.state.filteredSurveys ? (
      <View style={flex1}>
        {this._renderSearchBar()}
        {this._renderPendingSurveyCount()}
        <Text style={textStyleTotalSurvey}>{`${i18n.t('TOTAL_SURVEYS')} ${
          this.state.surveys.length
        }`}</Text>
        {this._renderFilterButtonGroup()}
        <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />
        <SelectionList
          data={this.state.filteredSurveys}
          titleKey="Survey_Heading"
          hideSearchBar
          subtitleKey="subtitle"
          searchTxt={this.props.searchTxt}
          searchBarLabel={i18n.t('SEARCH_SURVEYS')}
          onPress={async item => {
            const createdSurvey = await getOfflineCreatedSurvey(item);
            const LocalId = item.LocalId;
            const IsLocallyCreated = item.IsLocallyCreated;
            this.props.navigation.push('Survey', {
              createdSurvey,
              LocalId,
              IsLocallyCreated,
              headerTitle: i18n.t('SURVEY_DETAIL'),
            });
          }}
          onSearchTextChanged={text => {
            this.filterSurveysByText(text);
          }}
        />
        {this._renderLoginModal()}
        {this._renderNewSurveyButton()}
      </View>
    ) : (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DDDDDD" />
      </View>
    );
  }
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
  textStylePendingSurvey: {
    padding: 10,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    flex: 8,
    backgroundColor: 'white',
    borderColor: APP_THEME.APP_BORDER_COLOR,
    borderWidth: 1,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  textStyleTotalSurvey: {
    paddingLeft: 10,
    paddingBottom: 5,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    backgroundColor: 'white',
  },
  textStyleFilterButton: {
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  pendingSurveyContainer: {
    minHeight: 50,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  syncIconStyle: {
    padding: 8,
    position: 'absolute',
    right: 10,
  },
  addButtonStyle: { position: 'absolute', bottom: 30, right: 30 },
});
