/* eslint-disable @typescript-eslint/camelcase */
import React, { PureComponent } from 'react';
import { SelectionList } from '../../../components';
import i18n from '../../../config/i18n';
import {
  getOfflineStoredSurveyMetadata,
  MotherChildPickerType__c,
} from '../../../services/API/Salesforce/Survey';

interface SurveyPickerProps {
  navigation: any;
  searchTxt: string;
}

export default class SurveyPicker extends PureComponent<SurveyPickerProps> {
  state = {
    surveyTypes: null,
    filteredSurveyTypes: null,
    searchTxt: '',
  };

  componentDidMount = async () => {
    const records = await getOfflineStoredSurveyMetadata();
    this.setState({ surveyTypes: records, filteredSurveyTypes: records });
  };

  filterSurveyTypes = text => {
    this.setState({ searchTxt: text });

    const { surveyTypes } = this.state;
    const filteredSurveyTypes = surveyTypes.filter(obj => obj.Name.includes(text));
    this.setState({ filteredSurveyTypes });
  };

  onSelection = survey => {
    if (
      survey.MotherChildPickerType__c === MotherChildPickerType__c.MOTHER_CHILD ||
      survey.MotherChildPickerType__c === MotherChildPickerType__c.MOTHER
    ) {
      this.props.navigation.push('MotherPicker', {
        survey,
        headerTitle: i18n.t('CHOOSE_MOTHER'),
      });
    } else if (survey.MotherChildPickerType__c === MotherChildPickerType__c.ANTE_NATAL) {
      this.props.navigation.push('MotherPicker', {
        survey,
        headerTitle: i18n.t('CHOOSE_MOTHER'),
      });
    } else if (survey.MotherChildPickerType__c === MotherChildPickerType__c.BENEFICIARY) {
      this.props.navigation.push('BeneficiaryPicker', {
        survey,
        headerTitle: i18n.t('CHOOSE_BENEFIACIARY'),
      });
    } else {
      this.props.navigation.push('Survey', {
        survey,
        headerTitle: i18n.t('NEW_SURVEY'),
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
        searchBarLabel={i18n.t('SEARCH_SURVEYS')}
        onSearchTextChanged={text => {
          this.filterSurveyTypes(text);
        }}
      />
    );
  }
}
