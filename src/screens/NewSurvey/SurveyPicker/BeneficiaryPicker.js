import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { SelectionList } from '../../../components';
import { labels } from '../../../stringConstants';
import { getBeneficiaries } from '../../../services/API/Salesforce/Contact';

export default class BeneficiaryPicker extends PureComponent {
  state = {
    beneficieries: null,
    filteredBeneficieries: null,
    searchTxt: ''
  };

  componentDidMount = async () => {
    const data = await getBeneficiaries();
    this.setState({ beneficieries: data, filteredBeneficieries: data });
  };

  filterMothers = text => {
    this.setState({ searchTxt: text });

    const { beneficieries } = this.state;
    const filteredBeneficieries = beneficieries.filter(
      obj => obj.Name.includes(text) || obj.Address_Locator__c.includes(text)
    );
    this.setState({ filteredBeneficieries });
  };

  onSelection = beneficiary => {
    const { survey } = this.props.navigation.state.params;
    this.props.navigation.push('NewSurvey', {
      survey,
      beneficiary,
      headerTitle: labels.NEW_SURVEY
    });
  };

  render() {
    return (
      <SelectionList
        data={this.state.filteredBeneficieries}
        titleKey="Name"
        subtitleKey="Address_Locator__c"
        onPress={item => {
          this.onSelection(item);
        }}
        searchTxt={this.props.searchTxt}
        searchBarLabel={labels.SEARCH_BENEFICIARIES}
        onSearchTextChanged={text => {
          this.filterMothers(text);
        }}
      />
    );
  }
}
