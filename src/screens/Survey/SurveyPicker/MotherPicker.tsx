/* eslint-disable @typescript-eslint/camelcase */
import React, { PureComponent } from 'react';
import { SelectionList } from '../../../components';
import i18n from '../../../config/i18n';
import { getMothers, getAnteNatalMothers } from '../../../services/API/Salesforce/Contact';
import { MotherChildPickerType__c } from '../../../services/API/Salesforce/Survey';

interface MotherPickerProps {
  navigation: any;
  searchTxt: string;
}

export default class MotherPicker extends PureComponent<MotherPickerProps> {
  state = {
    mothers: null,
    filteredMothers: null,
    searchTxt: '',
  };

  componentDidMount = async () => {
    const { survey } = this.props.navigation.state.params;
    if (survey.MotherChildPickerType__c == MotherChildPickerType__c.ANTE_NATAL) {
      const data = await getAnteNatalMothers();
      this.setState({ mothers: data, filteredMothers: data });
    } else {
      const data = await getMothers();
      this.setState({ mothers: data, filteredMothers: data });
    }
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
    if (survey.MotherChildPickerType__c === MotherChildPickerType__c.MOTHER_CHILD) {
      this.props.navigation.push('ChildPicker', {
        mother,
        survey,
        headerTitle: i18n.t('CHOOSE_CHILD'),
      });
    } else {
      this.props.navigation.push('Survey', {
        mother,
        survey,
        headerTitle: i18n.t('NEW_SURVEY'),
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
        searchBarLabel={i18n.t('SEARCH_MOTHERS')}
        onSearchTextChanged={text => {
          this.filterMothers(text);
        }}
      />
    );
  }
}
