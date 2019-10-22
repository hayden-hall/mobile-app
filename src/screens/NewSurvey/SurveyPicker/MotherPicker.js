import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { SelectionList } from '../../../components';
import { labels } from '../../../stringConstants';
import { getMothers } from '../../../services/API/Salesforce/Contact';
import { MotherChildPickerType__c } from '../../../services/API/Salesforce/Survey';

export default class MotherPicker extends PureComponent {
  state = {
    mothers: null,
    filteredMothers: null,
    searchTxt: ''
  };

  componentDidMount = async () => {
    const data = await getMothers();
    this.setState({ mothers: data, filteredMothers: data });
  };

  filterMothers = text => {
    this.setState({ searchTxt: text });

    const { mothers } = this.state;
    const filteredMothers = mothers.filter(
      obj => obj.Name.includes(text) || obj.Address_Locator__c.includes(text)
    );
    this.setState({ filteredMothers });
  };

  onSelection = mother => {
    const { survey } = this.props.navigation.state.params;
    if (
      survey.MotherChildPickerType__c === MotherChildPickerType__c.MOTHER_CHILD
    ) {
      this.props.navigation.push('ChildPicker', {
        mother,
        survey,
        headerTitle: labels.CHOOSE_CHILD
      });
    } else {
      this.props.navigation.push('NewSurvey', {
        mother,
        survey,
        headerTitle: labels.NEW_SURVEY
      });
    }
  };

  render() {
    return (
      <SelectionList
        data={this.state.filteredMothers}
        titleKey="Name"
        subtitleKey="Address_Locator__c"
        onPress={item => {
          this.onSelection(item);
        }}
        searchTxt={this.props.searchTxt}
        searchBarLabel={labels.SEARCH_MOTHERS}
        onSearchTextChanged={text => {
          this.filterMothers(text);
        }}
      />
    );
  }
}
