/* eslint-disable @typescript-eslint/camelcase */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, CheckBoxButton, Picklist, DatePicker } from '../../components';

interface SurveyItemProps {
  item: any;
  index: any;
  section: any;
  onChoiceChanged: any;
}

export default class SurveyItem extends PureComponent<SurveyItemProps> {
  _renderTextField = keyboardType => {
    const { QuestionText__c, Answer__c, disabled } = this.props.item;
    return (
      <TextInput
        disabled={disabled}
        keyboardType={keyboardType}
        value={Answer__c}
        label={QuestionText__c}
        placeholder={QuestionText__c}
        onChangeText={text => {
          this._onChoiceChanged(text);
        }}
      />
    );
  };

  _renderTextArea = () => {
    const { QuestionText__c, Answer__c, disabled } = this.props.item;
    return (
      <TextInput
        disabled={disabled}
        multiline
        onChangeText={text => {
          this._onChoiceChanged(text);
        }}
        value={Answer__c}
        label={QuestionText__c}
        placeholder={QuestionText__c}
      />
    );
  };

  _renderCheckbox = () => {
    const { QuestionText__c, Answer__c, disabled } = this.props.item;
    return (
      <CheckBoxButton
        disabled={disabled}
        title={QuestionText__c}
        selected={Answer__c}
        onPress={() => {
          this._onChoiceChanged(!Answer__c);
        }}
      />
    );
  };

  _renderPicklist = () => {
    const { QuestionText__c, Answer__c, OptionsValue__c, disabled } = this.props.item;
    const options = OptionsValue__c.split(';');
    return (
      <Picklist
        disabled={disabled}
        title={QuestionText__c}
        value={Answer__c}
        options={options}
        onValueChange={itemValue => {
          this._onChoiceChanged(itemValue);
        }}
      />
    );
  };

  _renderDatePicker = () => {
    const { QuestionText__c, Answer__c, disabled } = this.props.item;
    return (
      <DatePicker
        disabled={disabled}
        title={QuestionText__c}
        value={Answer__c}
        onValueChange={itemValue => {
          this._onChoiceChanged(itemValue);
        }}
      />
    );
  };

  _renderComponent = () => {
    const { QuestionType__c } = this.props.item;
    switch (QuestionType__c) {
      case 'Text':
        return this._renderTextField('default');
        break;
      case 'Number':
        return this._renderTextField('numeric');
        break;
      case 'Phone':
        return this._renderTextField('phone-pad');
        break;
      case 'TextArea':
        return this._renderTextArea();
        break;
      case 'Checkbox':
        return this._renderCheckbox();
        break;
      case 'Picklist':
        return this._renderPicklist();
        break;
      case 'Date':
        return this._renderDatePicker();
        break;
      default:
        break;
    }
  };

  _onChoiceChanged = answer => {
    const { item, index, section } = this.props;
    console.log('answer', answer);
    if (this.props.onChoiceChanged) {
      this.props.onChoiceChanged(answer, item, index, section);
    }
  };

  render = () => {
    const { innerContainer } = styles;
    return <View style={innerContainer}>{this._renderComponent()}</View>;
  };
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
});
