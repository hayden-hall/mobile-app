/* eslint-disable @typescript-eslint/camelcase */
import { getLoggedInCDWContact, getLoggedInUserMothersChilds } from './api/salesforce/Contact';
import { getCDWClientJunctionObjects } from './api/salesforce/CDWJunction';
import {
  getAllSurveysFromSalesforce,
  getAllSurveyMetadataFromSalesforce,
  getAllSurveySectionsFromSalesforce,
  getAllSurveyQuestionsFromSalesforce,
  getOfflineSurveys,
  uploadSurveyToSalesforce,
} from './api/salesforce/Survey';
import { ASYNC_STORAGE_KEYS } from '../constants';

export const refreshAll = async () => {
  const CDW_Worker_Id = await getLoggedInCDWContact();
  const AREA_CODE = await storage.load({
    key: ASYNC_STORAGE_KEYS.AREA_CODE,
  });
  if (CDW_Worker_Id && AREA_CODE) {
    await syncUpData();

    //fetch CDW juncton objects first.
    const cdwResponse = await getCDWClientJunctionObjects(CDW_Worker_Id);
    if (cdwResponse.records) {
      const cdwRecords = cdwResponse.records;
      //Fetch all mother belongs to this CDW.

      const motherIds = cdwRecords.map(record => record.Mother__c && record.Mother__c);
      //Fetch all childs belongs to this CDW.
      const childIds = cdwRecords.map(record => record.Child__c && record.Child__c);
      //Fetch all beneficiaries belongs to this CDW.
      const beneIds = cdwRecords.map(
        record => record.Beneficiary_Name__c && record.Beneficiary_Name__c
      );

      //Now fetch all contacts for mothers and childs fall under logged in cdw worker.
      await getLoggedInUserMothersChilds([
        ...(motherIds || []),
        ...(childIds || []),
        ...(beneIds || []),
      ]);

      //Download all available survey metadata
      await getAllSurveyMetadataFromSalesforce();
      await getAllSurveySectionsFromSalesforce();
      const surveyQuestionsResponse = await getAllSurveyQuestionsFromSalesforce();

      //Fetch all surveys for logged in user:
      const surveyFields = getSurveyFields(surveyQuestionsResponse.records);
      await getAllSurveysFromSalesforce(AREA_CODE, surveyFields);

      return Promise.resolve(true);
    } else {
      return Promise.reject('Login Failed');
    }

    return Promise.resolve(true);
  } else {
    return Promise.reject('Logged In user not found, Please login again.');
  }
};

const syncUpData = async () => {
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
