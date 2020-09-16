// @deprecated
import React, { PureComponent } from 'react';
import { Alert, View, StyleSheet, Text, ActivityIndicator, } from 'react-native';
import { Divider } from 'react-native-elements';

import PropTypes from 'prop-types';
import { APP_THEME, APP_FONTS } from '../constants';
import { DB_TABLE, deleteRecord } from '../services/database';
import { SearchBar } from './SearchBar';

import i18n from '../config/i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  
});

class SelectionList extends PureComponent {
  

  static get propTypes() {
    return {
      data: PropTypes.any,
      titleKey: PropTypes.string,
      subtitleKey: PropTypes.string,
      onPress: PropTypes.func,
      hideSearchBar: PropTypes.bool,
      searchBarLabel: PropTypes.string,
      searchTxt: PropTypes.string,
      onSearchTextChanged: PropTypes.func,
      onDelete: PropTypes.func,
    };
  }

  renderItem = item => {
    const { titleKey, subtitleKey, onPress } = this.props;
    return (
      <ListItem
        title={item.item[titleKey]}
        subtitle={item.item[subtitleKey]}
        onPress={() => {
          onPress && onPress(item.item);
        }}
        showCaret={item.item.showCaret}
      />
    );
  };

  _renderSearchBar = () => (
    <SearchBar
      placeholder={this.props.searchBarLabel}
      value={this.props.searchTxt}
      onChangeText={searchTxt => this.props.onSearchTextChanged(searchTxt)}
    />
  );

  renderSeparator = () => {
    return ;
  };

  showDeleteConfirmAlert = (rowMap, item, index) => {
    Alert.alert(
      i18n.t('DELETE'),
      i18n.t('DELETE_MESSAGE'),
      [
        {
          text: i18n.t('DELETE'),
          onPress: async () => {
            if (rowMap[index]) {
              rowMap[index].closeRow();
            }
            await deleteRecord(DB_TABLE.SURVEY, item.LocalId);
            return this.props.onDelete(item);
          },
        },
        {
          text: i18n.t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  };

  render() {
    return this.props.data ? (
      <View style={styles.flex1}>
        
      </View>
    ) : (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }
}

export { SelectionList };
