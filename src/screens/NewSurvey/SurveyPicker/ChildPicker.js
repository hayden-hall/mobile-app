import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { SelectionList } from '../../../components';
import { getChildsForMother } from '../../../services/API/Salesforce/Contact';
import { labels } from '../../../stringConstants';

export default class ChildPicker extends PureComponent {
  state = {
    childs: null,
    filteredChilds: null,
    searchTxt: ''
  };

  componentDidMount = async () => {
    const { mother } = this.props.navigation.state.params;
    if (mother) {
      const data = await getChildsForMother(mother.Id);
      this.setState({ childs: data, filteredChilds: data });
    }
  };

  filterChilds = text => {
    this.setState({ searchTxt: text });

    const { childs } = this.state;
    const filteredChilds = childs.filter(obj => obj.Name.includes(text));
    this.setState({ filteredChilds });
  };

  onSelection = child => {
    const { mother, survey } = this.props.navigation.state.params;
    this.props.navigation.push('NewSurvey', {
      child,
      mother,
      survey,
      headerTitle: labels.NEW_SURVEY
    });
  };

  render() {
    return (
      <SelectionList
        data={this.state.filteredChilds}
        titleKey="Name"
        onPress={item => {
          this.onSelection(item);
        }}
        searchTxt={this.props.searchTxt}
        searchBarLabel={labels.SEARCH_CHILDS}
        onSearchTextChanged={text => {
          this.filterChilds(text);
        }}
      />
    );
  }
}
