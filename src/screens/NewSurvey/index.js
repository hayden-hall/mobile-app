import React from 'react';
import { View, Text, StyleSheet, SectionList, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CustomButton } from '../../components';
import { labels } from '../../stringConstants';
import { APP_FONTS, APP_THEME, ASYNC_STORAGE_KEYS } from '../../constants';
import SurveyItem from './SurveyItem';
import {
  getOfflineSurveyQuestionsForSurveyMetadata,
  createNewSurvey,
  updateSurvey
} from '.././../services/API/Salesforce/Survey';
import { formatAPIDate, checkForDatabaseNull } from '../../utility';

export default class NewSurvey extends React.Component {
  state = {
    sections: [],
    selectedLanguage: 'en-US'
  };
  componentDidMount = () => {
    this.getSurveyQuestions();
  };

  getSurveyQuestions = async () => {
    const selectedLanguage = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.LANGUAGE
    );
    this.setState({ selectedLanguage: selectedLanguage || 'en-US' });

    const { survey, createdSurvey, LocalId, IsLocallyCreated } = this.props.navigation.state.params;
    if (createdSurvey) {
      this.setState({ sections: createdSurvey });
      this.setState({ LocalId: LocalId });
      this.setState({ IsLocallyCreated: IsLocallyCreated });
      console.log('RESULT', createdSurvey);
    } else {
      const sections = await getOfflineSurveyQuestionsForSurveyMetadata(
        survey.Id
      );
      this.setState({ sections });
      console.log('RESULT', sections);
      this.populateMotherChildData();
    }
  };

  populateMotherChildData = async () => {
    const {
      survey,
      mother,
      child,
      beneficiary
    } = this.props.navigation.state.params;
    const areaCode = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AREA_CODE);
    this.findAPINameAndReplace('Area_Code__c', areaCode);
    if (mother) {
      this.findAPINameAndReplace(
        'Mother__c',
        `${mother.FirstName} ${mother.LastName}`
      );
    }
    if (child) {
      this.findAPINameAndReplace(
        'Child__c',
        `${child.FirstName} ${child.LastName}`
      );
    }
    if (beneficiary) {
      this.findAPINameAndReplace(
        'Beneficiary_Name__c',
        `${beneficiary.FirstName} ${beneficiary.LastName}`
      );
    }
  };

  findAPINameAndReplace = (APIName__c, Answer__c) => {
    var sections = this.state.sections.map(objSection => {
      var data = objSection.data.map(question => {
        if (question.APIName__c === APIName__c) {
          return {
            ...question,
            disabled: true,
            Answer__c: Answer__c
          };
        } else {
          return { ...question };
        }
      });
      return { ...objSection, data };
    });
    this.setState({ sections });
  };

  onChoiceChanged = (answer, item, index, section) => {
    var sections = this.state.sections.map(objSection => {
      if (objSection.Id === section.Id) {
        let data = objSection.data;
        objSection.data[index] = {
          ...objSection.data[index],
          Answer__c: answer
        };
        return { ...objSection, data };
      }
      return { ...objSection };
    });
    this.setState({ sections });
  };

  renderItem = ({ item, index, section }) => {
    let { QuestionText__c, Question_Name_Nepali__c } = item;
    if (this.state.selectedLanguage === 'ne') {
      QuestionText__c = checkForDatabaseNull(Question_Name_Nepali__c)
        ? Question_Name_Nepali__c
        : QuestionText__c;
    }
    return (
      <SurveyItem
        item={{ ...item, QuestionText__c }}
        index={index}
        section={section}
        onChoiceChanged={this.onChoiceChanged}
      />
    );
  };

  renderSectionHeader = ({ section: { Name, Section_Name_Nepali__c } }) => {
    let title = Name;
    if (
      this.state.selectedLanguage === 'ne' &&
      checkForDatabaseNull(Section_Name_Nepali__c)
    ) {
      title = Section_Name_Nepali__c;
    }

    const { headerView, sectionTitle } = styles;
    return (
      <View style={headerView}>
        <Text style={sectionTitle}>{title.toUpperCase()}</Text>
      </View>
    );
  };

  onSave = async () => {
    const { sections } = this.state;
    let surveyPacket = {};

    sections.forEach(section => {
      section.data.forEach(question => {
        if (question.Answer__c) {
          const answer =
            question.QuestionType__c === 'Date'
              ? formatAPIDate(question.Answer__c)
              : question.Answer__c;
          surveyPacket = {
            ...surveyPacket,
            [question.APIName__c]: answer
          };
        } else if (question.QuestionType__c === 'Checkbox') {
          surveyPacket = {
            ...surveyPacket,
            [question.APIName__c]: false
          };
        }
      });
    });

    const {
      survey,
      mother,
      child,
      beneficiary
    } = this.props.navigation.state.params;
    //Populate the Survey Record Type. (When creating)
    if(survey) {
      surveyPacket = {
        ...surveyPacket,
        RecordTypeId: survey.SurveyRecordTypeId__c
      };
    }
    //Populate Visit date.
    const visitDate = formatAPIDate(new Date());
    surveyPacket = { ...surveyPacket, Visit_Clinic_Date__c: visitDate };

    //Populate Area Code.
    const areaCode = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AREA_CODE);
    surveyPacket = { ...surveyPacket, Area_Code__c: areaCode };

    //Populate mother and child
    if (mother) {
      surveyPacket = { ...surveyPacket, Mother__c: mother.Id };
    }
    if (child) {
      surveyPacket = { ...surveyPacket, Child__c: child.Id };
    }
    if (beneficiary) {
      surveyPacket = { ...surveyPacket, Beneficiary_Name__c: beneficiary.Id };
    }

    console.log('FINAL SURVEY', surveyPacket);

    try {
      if(!this.state.LocalId) {
        await createNewSurvey(surveyPacket);
      } else {
        await updateSurvey(surveyPacket, this.state.LocalId);
      }
      this.props.navigation.push('SurveyCompleted', {
        headerTitle: labels.SURVEY_COMPLETED
      });
    } catch (error) {
      Alert.alert(
        labels.ERROR,
        labels.ERROR_ON_SAVE,
        [
          {
            text: labels.OK,
            onPress: async () => {}
          }
        ],
        { cancelable: true }
      );
    }
  };

  render = () => {
    const { createdSurvey } = this.props.navigation.state.params;
    return (
      <KeyboardAwareScrollView>
        <View style={styles.flex1}>
          <SectionList
            onChoiceChanged={answer => {
              this.onChoiceChanged(answer);
            }}
            style={styles.flex1}
            renderItem={this.renderItem}
            renderSectionHeader={this.renderSectionHeader}
            sections={this.state.sections}
            keyExtractor={(item, index) => item + index}
            ListFooterComponent={
              (!createdSurvey || this.state.IsLocallyCreated) && (
                <View style={styles.inputButton}>
                  <CustomButton
                    title={!this.state.LocalId ? labels.SAVE : labels.UPDATE}
                    onPress={() => {
                      this.onSave();
                    }}
                  />
                </View>
              )
            }
          />
        </View>
      </KeyboardAwareScrollView>
    );
  };
}

const styles = StyleSheet.create({
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 },
  headerView: {
    backgroundColor: APP_THEME.APP_LIST_HEADER_COLOR,
    justifyContent: 'center'
  },
  sectionTitle: {
    fontSize: 10,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    letterSpacing: 0.42,
    padding: 10,
    fontFamily: APP_FONTS.FONT_REGULAR
  },
  flex1: {
    flex: 1
  }
});
