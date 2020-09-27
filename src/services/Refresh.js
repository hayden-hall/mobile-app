/* eslint-disable @typescript-eslint/camelcase */
import { getLoggedInCDWContact, getLoggedInUserMothersChilds } from './api/salesforce/contact';
import {
  getAllSurveysFromSalesforce,
  getOfflineSurveys,
  uploadSurveyToSalesforce,
  getAllSurveyQuestionsFromSalesforce,
} from './api/salesforce/Survey';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { logger } from '../utility/logger';

export const refreshAll = async () => {
  logger('DEBUG', 'refreshAll', 'start');
  const CDW_Worker_Id = await getLoggedInCDWContact();
  const AREA_CODE = await storage.load({
    key: ASYNC_STORAGE_KEYS.AREA_CODE,
  });
  if (!CDW_Worker_Id || !AREA_CODE) {
    return Promise.reject('Logged In user not found, Please login again.');
  }
  const surveyQuestionsResponse = await getAllSurveyQuestionsFromSalesforce();

  //Fetch all surveys for logged in user:
  const surveyFields = getSurveyFields(surveyQuestionsResponse.records);
  await getAllSurveysFromSalesforce(AREA_CODE, surveyFields);
  // logger('DEBUG', 'refreshAll', 'end');
  return Promise.resolve(true);
};

export const syncUpData = async () => {
  try {
    const offlineSurveys = await getOfflineSurveys();
    await Promise.all(
      offlineSurveys.map(async survey => {
        const response = await uploadSurveyToSalesforce(survey);
      })
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const getSurveyFields = questions => {
  let fields = questions.map(question => {
    let dataType = 'TEXT';
    if (question.QuestionType__c == 'Number') {
      dataType = 'REAL';
    }
    if (question.QuestionType__c == 'Checkbox') {
      dataType = 'INTEGER';
    }
    return `${question.APIName__c}#${dataType}`;
  });

  const additionalFields = [
    'Id#TEXT',
    'Visit_Clinic_Date__c#TEXT',
    'Child__c#TEXT',
    'Mother__c#TEXT',
    'Area_Code__c#TEXT',
    'RecordTypeId#TEXT',
    'Name#TEXT',
  ];

  fields = [...fields, ...additionalFields];

  const uniqueFields = [...new Set(fields)];
  console.log(uniqueFields);
  return uniqueFields;
};
