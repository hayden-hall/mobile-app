import React, { PureComponent, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Text,
  Modal
} from 'react-native';
import i18n from '../../config/i18n';
import { APP_FONTS, APP_THEME, ASYNC_STORAGE_KEYS } from '../../constants';
import { SelectionList, SearchBar } from '../../components';
import { Icon, Divider, Button } from 'react-native-elements';
import {
  getAllSurveys,
  getOfflineCreatedSurvey
} from '../../services/API/Salesforce/Survey';
import NetInfo from '@react-native-community/netinfo';
import { refreshAll } from '../../services/Refresh';
import { formatDate } from '../../utility';
import Login from '../Auth/Login';

export default class SurveyList extends PureComponent {
  static navigationOptions = {
    title: 'Home'
  };

  state = {
    surveys: [],
    filteredSurveys: [],
    searchTxt: '',
    refreshButtonState: true,
    isNetworkConnected: false,
    dirtySurveyCount: 0,
    showLoginModal: false
  };

  fetchData = async () => {
    try {
      const data = await getAllSurveys();
      await this.setState({ surveys: data });

      //Prepare the list for Selection List Component
      this.prepareListdata(data);
    } catch (error) {}
  };

  componentDidMount = () => {
    this._navListener = this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.fetchData();
      }
    );
    
    NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      const isNetworkConnected = state.isConnected;
      storage.save({
        key: ASYNC_STORAGE_KEYS.NETWORK_CONNECTIVITY,
        data: `${isNetworkConnected}`
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

  fetchConnectivity = async () => {
    const isNetworkConnected = (await NetInfo.fetch()).isConnected;
    console.log('NET INFO', isNetworkConnected);

    
  };

  refreshAppData = async () => {
    try {
      this.props.showHideLoading(true);
      const result = await refreshAll();
      this.fetchData();
      this.props.showHideLoading(false);
    } catch (error) {
      this.props.showHideLoading(false);
      setTimeout(() => {
        if (
          error === 'Login Failed' ||
          error === 'Session expired or invalid'
        ) {
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
        subtitle: `${object.Survey_Type} • ${formatDate(
          object.Visit_Clinic_Date__c
        )}`,
        showCaret: object.IsLocallyCreated !== 0
      };
    });
    this.setState({ filteredSurveys });
    this.setRefreshButtonState();
  };

  filterSurveys = text => {
    if (this.state.surveys) {
      this.setState({ searchTxt: text });
      const { surveys } = this.state;
      const filteredSurveys = surveys.filter(
        obj =>
          obj.Survey_Heading.includes(text) ||
          obj.Survey_Type.includes(text) ||
          obj.Visit_Clinic_Date__c.includes(text)
      );
      this.prepareListdata(filteredSurveys);
    }
  };

  setRefreshButtonState = () => {
    const { surveys, isNetworkConnected } = this.state;
    const getDirtySurveys = surveys.filter(object => object.IsLocallyCreated);
    const refreshButtonState = isNetworkConnected;
    this.setState({
      refreshButtonState,
      dirtySurveyCount: getDirtySurveys.length
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
          }
        },
        {
          text: i18n.t('CANCEL')
        }
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
            titleStyle={{
              fontSize: 18,
              fontFamily: APP_FONTS.FONT_REGULAR
            }}
            titleStyle={
              refreshButtonState
                ? { color: APP_THEME.APP_WHITE }
                : { color: APP_THEME.APP_DARK_FONT_COLOR }
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
      onChangeText={searchTxt => this.filterSurveys(searchTxt)}
    />
  );

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
              headerTitle: i18n.t('CHOOSE_SURVEY')
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
        <Text
          style={textStyleTotalSurvey}
        >{`${i18n.t('TOTAL_SURVEYS')} ${this.state.surveys.length}`}</Text>
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
            this.props.navigation.push('NewSurvey', {
              createdSurvey,
              LocalId,
              IsLocallyCreated,
              headerTitle: i18n.t('SURVEY_DETAIL')
            });
          }}
          onSearchTextChanged={text => {
            this.filterSurveys(text);
          }}
        />
        {this._renderLoginModal()}
        {this._renderNewSurveyButton()}
      </View>
    ) : (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flex1: {
    flex: 1,
    backgroundColor: 'white'
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
    borderBottomLeftRadius: 2
  },
  textStyleTotalSurvey: {
    paddingLeft: 10,
    paddingBottom: 5,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    backgroundColor: 'white'
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
    flexDirection: 'row'
  },
  syncIconStyle: {
    // borderRightWidth: 1,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderBottomColor: APP_THEME.APP_BORDER_COLOR,
    // borderTopColor: APP_THEME.APP_BORDER_COLOR,
    // borderRightColor: APP_THEME.APP_BORDER_COLOR,
    padding: 8,
    position: 'absolute',
    right: 10
    // borderTopRightRadius: 2,
    // borderBottomRightRadius: 2
  },
  addButtonStyle: { position: 'absolute', bottom: 30, right: 30 }
});
