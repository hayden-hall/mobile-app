import React, { PureComponent } from 'react';
import { SelectionList } from '../../../components';
import { getChildsForMother } from '../../../services/API/Salesforce/Contact';
import i18n from '../../../config/i18n';

interface ChildPickerProps {
  navigation: any;
  searchTxt: string;
}

export default class ChildPicker extends PureComponent<ChildPickerProps> {
  state = {
    childs: null,
    filteredChilds: null,
    searchTxt: '',
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
    this.props.navigation.push('Survey', {
      child,
      mother,
      survey,
      headerTitle: i18n.t('NEW_SURVEY'),
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
        searchBarLabel={i18n.t('SEARCH_CHILDS')}
        onSearchTextChanged={text => {
          this.filterChilds(text);
        }}
      />
    );
  }
}
