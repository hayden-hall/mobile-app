import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { SelectionList } from '../../../components';
import { labels } from '../../../stringConstants';
import {
  getOfflineStoredSurveyMetadata,
  MotherChildPickerType__c
} from '../../../services/API/Salesforce/Survey';

export default class SurveyPicker extends PureComponent {
  state = {
    surveyTypes: null,
    filteredSurveyTypes: null,
    searchTxt: ''
  };

  componentDidMount = async () => {
    const records = await getOfflineStoredSurveyMetadata();
    console.log('getOfflineStoredSurveyMetadata()', records);
    this.setState({ surveyTypes: records, filteredSurveyTypes: records });
  };

  filterSurveyTypes = text => {
    this.setState({ searchTxt: text });

    const { surveyTypes } = this.state;
    const filteredSurveyTypes = surveyTypes.filter(obj =>
      obj.Name.includes(text)
    );
    this.setState({ filteredSurveyTypes });
  };

  onSelection = survey => {
    if (
      survey.MotherChildPickerType__c ===
        MotherChildPickerType__c.MOTHER_CHILD ||
      survey.MotherChildPickerType__c === MotherChildPickerType__c.MOTHER
    ) {
      this.props.navigation.push('MotherPicker', {
        survey,
        headerTitle: labels.CHOOSE_MOTHER
      });
    } else if (
      survey.MotherChildPickerType__c === MotherChildPickerType__c.ANTE_NATAL
    ) {
      this.props.navigation.push('MotherPicker', {
        survey,
        headerTitle: labels.CHOOSE_MOTHER
      });
    } else if (
      survey.MotherChildPickerType__c === MotherChildPickerType__c.BENEFICIARY
    ) {
      this.props.navigation.push('BeneficiaryPicker', {
        survey,
        headerTitle: labels.CHOOSE_BENEFIACIARY
      });
    } else {
      this.props.navigation.push('NewSurvey', {
        survey,
        headerTitle: labels.NEW_SURVEY
      });
    }
  };

  render() {
    return (
      <SelectionList
        data={this.state.filteredSurveyTypes}
        titleKey="Name"
        onPress={item => {
          this.onSelection(item);
        }}
        searchTxt={this.props.searchTxt}
        searchBarLabel={labels.SEARCH_SURVEYS}
        onSearchTextChanged={text => {
          this.filterSurveyTypes(text);
        }}
      />
    );
  }
}
