import React, { PureComponent } from 'react';
import { Alert, View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import { APP_THEME, APP_FONTS } from '../constants';
import { SearchBar } from './SearchBar';
import { ListItem } from './ListItem';
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

class SelectionList extends PureComponent {
  _keyExtractor = (item, index) => index.toString();

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
    return <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />;
  };

  async componentDidMount() {}

  showDeleteConfirmAlert = () => {
    Alert.alert(
      i18n.t('DELETE'),
      i18n.t('DELETE_MESSAGE'),
      [
        {
          text: i18n.t('DELETE'),
          onPress: async () => {},
        },
        {
          text: i18n.t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  }

  render() {
    return this.props.data ? (
      <View style={styles.flex1}>
        <SwipeListView
          ListHeaderComponent={
            !this.props.hideSearchBar && this._renderSearchBar()
          }
          data={this.props.data}
          renderItem={this.renderItem}
          keyExtractor={this._keyExtractor}
          ItemSeparatorComponent={this.renderSeparator}
          renderHiddenItem={ (data, rowMap) => data.item.IsLocallyCreated ? (
            <View style={styles.rowBack}>
              <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={this.showDeleteConfirmAlert}>
                <Text style={styles.backTextWhite}>{i18n.t('DELETE')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.rowBack}>
              <TouchableOpacity style={[styles.backRightBtn, styles.backDisabledRightBtnRight]}>
                <Text style={styles.backTextWhite}>{i18n.t('DELETE')}</Text>
              </TouchableOpacity>
            </View>
          )
          }
          disableRightSwipe
          rightOpenValue={-75}
        />
      </View>
    ) : (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }
}

export { SelectionList };
