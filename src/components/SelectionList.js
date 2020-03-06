import React, { PureComponent } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { APP_THEME } from '../constants';
import { SearchBar } from './SearchBar';
import { ListItem } from './ListItem';
import { Divider } from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flex1: {
    flex: 1
  }
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

  render() {
    return this.props.data ? (
      <View style={styles.flex1}>
        <FlatList
          ListHeaderComponent={
            !this.props.hideSearchBar && this._renderSearchBar()
          }
          data={this.props.data}
          renderItem={this.renderItem}
          keyExtractor={this._keyExtractor}
          ItemSeparatorComponent={this.renderSeparator}
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
