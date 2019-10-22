import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Alert,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { labels } from '../../stringConstants';
import { Picklist } from '../../components';
import { APP_FONTS, APP_THEME, ASYNC_STORAGE_KEYS } from '../../constants';
import { Divider, ListItem } from 'react-native-elements';

const languages = [
  { name: 'English', code: 'en-US' },
  { name: 'Nepali', code: 'ne' }
];

export default class Settings extends React.Component {
  state = {
    selectedLanguageCode: ''
  };

  componentDidMount = () => {
    this.getDefaultLanguage();
  };

  getDefaultLanguage = async () => {
    const languageCode = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.LANGUAGE
    );
    if (languageCode) {
      this.setState({ selectedLanguageCode: languageCode });
    }
  };

  // _onChoiceChanged = async itemValue => {
  //   if (itemValue) {
  //     const records = languages.filter(language => language.name === itemValue);
  //     if (records && records.length > 0) {
  //       labels.setLanguage(records[0].code);
  //       await AsyncStorage.setItem(
  //         ASYNC_STORAGE_KEYS.LANGUAGE,
  //         records[0].code
  //       );
  //       this.setState({ selectedLanguage: itemValue });
  //       setTimeout(() => {
  //         this.props.navigation.setParams({ headerTitle: labels.SETTINGS });
  //       }, 500);
  //     }
  //   }
  // };

  _onChoiceChanged = async item => {
    labels.setLanguage(item.code);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LANGUAGE, item.code);
    this.setState({ selectedLanguageCode: item.code });
    setTimeout(() => {
      this.props.navigation.setParams({ headerTitle: labels.LANGUAGE });
    }, 500);
  };

  renderItem = item => {
    return (
      <ListItem
        key={item.index}
        title={item.item.name}
        checkmark={this.state.selectedLanguageCode === item.item.code}
        onPress={() => {
          this._onChoiceChanged(item.item);
        }}
      />
    );
  };

  renderSeparator = () => {
    return <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />;
  };

  _keyExtractor = (item, index) => index.toString();

  render = () => {
    return (
      <View style={styles.flex1}>
        <FlatList
          data={languages}
          renderItem={this.renderItem}
          keyExtractor={this._keyExtractor}
          ItemSeparatorComponent={this.renderSeparator}
          extraData={this.state.selectedLanguageCode}
        />
      </View>
    );
  };

  // render = () => {
  //   return (
  //     <View style={styles.flex1}>
  //       <Picklist
  //         hideNone
  //         title={labels.LANGUAGE}
  //         value={this.state.selectedLanguage}
  //         options={this.state.languagesString}
  //         onValueChange={itemValue => {
  //           this._onChoiceChanged(itemValue);
  //         }}
  //       />
  //     </View>
  //   );
  // };
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  }
});
