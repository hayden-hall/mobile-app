import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import i18n from '../../config/i18n';
import { APP_THEME } from '../../constants';
import { Divider, ListItem } from 'react-native-elements';

const languages = [
  { name: 'English', code: 'en' },
  { name: 'Nepali', code: 'ne' },
];

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});

interface Props {
  navigation: any;
}

export default class Settings extends React.Component<Props> {
  state = {
    selectedLanguageCode: '',
  };

  componentDidMount = () => {
    this.setState({ selectedLanguageCode: i18n.locale });
  };

  _onChoiceChanged = async item => {
    i18n.locale = item.code;
    this.setState({ selectedLanguageCode: item.code });
    setTimeout(() => {
      this.props.navigation.setParams({ headerTitle: i18n.t('LANGUAGE') });
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
}
