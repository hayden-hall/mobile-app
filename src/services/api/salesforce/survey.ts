/* eslint-disable @typescript-eslint/camelcase */
import { getSalesforceRecords, createSalesforceRecord, fetchSalesforceRecords } from './core';
import {
  saveRecordsOld,
  updateRecord,
  DB_TABLE,
  clearTable,
  getRecords,
  getAllRecords,
  saveRecordsWithFields,
  markRecordNonDirty,, saveRecords
} from '../../database';
import { prepareIdsForSqllite } from '../../../utility';
import { getAllOfflineContacts } from './contact';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import i18n from '../../../config/i18n';
import { checkForDatabaseNull } from '../../../utility';
import { PageLayoutItem } from '../../../types/sqlite';

export const MotherChildPickerType__c = {
  NONE: '',
  MOTHER: 'Mother',
  MOTHER_CHILD: 'Mother-Child',
  ANTE_NATAL: 'Ante-Natal',
  BENEFICIARY: 'Beneficiary',
};

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo Use constants
 */
export const storeOnlineSurveys = async () => {
  // Build field list from page layout items
  const fields: Array<PageLayoutItem> = await getAllRecords(DB_TABLE.PAGE_LAYOUT_ITEM);
  const commaSeparetedFields = Array.from(new Set(fields.map(f => f.fieldName))).join(',');
  
  const areaCode = await storage.load({
    key: ASYNC_STORAGE_KEYS.AREA_CODE,
  });
  const surveys = await fetchSalesforceRecords(
    `SELECT ${commaSeparetedFields} FROM Survey__c WHERE Area_Code__c = '${areaCode}'`
  );
  // Surveys should have sync status and local id for offline surveys
  saveRecords('Survey', surveys.map(s => ({...s, syncStatus: 'Synced' })), undefined); 
};

const getAllSurveysFromSalesforce = async (areaCode, fieldsWithDataType) => {
  const fields = fieldsWithDataType.map(fieldWithDataType => fieldWithDataType.split('#')[0]);
  const fieldsString = fields.join(',');
  const query = `SELECT ${fieldsString} FROM Survey__c WHERE Area_Code__c = '${areaCode}'`;
  const response = await getSalesforceRecords(query);
  if (response.records) {
    await clearTable(DB_TABLE.SURVEY);
    await saveRecordsWithFields(DB_TABLE.SURVEY, response.records, fieldsWithDataType);
    return response;
  } else {
    if (response.length > 0) {
      return Promise.reject(response[0].message);
    }
  }
};

export const getAllSurveys = async () => {
  let records = await getAllRecords(DB_TABLE.SURVEY);
  const contacts = await getAllOfflineContacts();
  const surveyMetadata = await getOfflineStoredSurveyMetadata();

  records = records.map(record => {
    let result = { ...record };

    //Find the survey Type.
    const survey = surveyMetadata.filter(object => `${object.SurveyRecordTypeId__c}` == `${record.RecordTypeId}`);
    if (survey && survey.length > 0) {
      result = { ...result, Survey_Type: survey[0].Name };
    }

    const motherChild = [];
    //Find the contacts for mother and child.
    const mother = contacts.filter(contact => contact.Id == record.Mother__c);
    if (mother && mother.length > 0) {
      motherChild.push(`${mother[0].FirstName} ${mother[0].LastName}`);
    } else if (checkForDatabaseNull(record.Mother_First_Name__c) && checkForDatabaseNull(record.Mother_Last_Name__c)) {
      motherChild.push(`${record.Mother_First_Name__c} ${record.Mother_Last_Name__c}`);
    }
    const child = contacts.filter(contact => contact.Id == record.Child__c);
    if (child && child.length > 0) {
      motherChild.push(`${child[0].FirstName} ${child[0].LastName}`);
    } else if (checkForDatabaseNull(record.Child_First_Name__c) && checkForDatabaseNull(record.Child_Last_Name__c)) {
      motherChild.push(`${record.Child_First_Name__c} ${record.Child_Last_Name__c}`);
    }

    const beneficiary = contacts.filter(contact => contact.Id == record.Beneficiary_Name__c);
    if (beneficiary && beneficiary.length > 0) {
      motherChild.push(`${beneficiary[0].FirstName} ${beneficiary[0].LastName}`);
    }

    result = {
      ...result,
      Survey_Heading: motherChild && motherChild.length > 0 ? motherChild.join(' • ') : record.Name,
    };

    return result;
  });

  //Sort the surveys to show the latest on top.
  records.sort((survey1, survey2) => {
    return (new Date(survey2.Visit_Clinic_Date__c) as any) - (new Date(survey1.Visit_Clinic_Date__c) as any);
  });

  return records;
};

export const getOfflineSurveys = async () => {
  return await getRecords(DB_TABLE.SURVEY, 'WHERE IsLocallyCreated = 1');
};

export const createNewSurvey = async survey => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  //TODO: Check for network connectivity, if connected then upload the survey to Saleforce and then save to database.
  //If no network is detected then save the record to local database.
  // @ts-ignore
  const connectivity = await storage.load({
    key: ASYNC_STORAGE_KEYS.NETWORK_CONNECTIVITY,
  });
  if (connectivity == true) {
    return await saveRecordsOld(DB_TABLE.SURVEY, [payload]);
  } else {
    return await saveRecordsOld(DB_TABLE.SURVEY, [payload]);
  }
};

export const updateSurvey = async (survey, LocalId) => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  //TODO: Check for network connectivity, if connected then upload the survey to Saleforce and then save to database.
  //If no network is detected then save the record to local database.

  // @ts-ignore
  const connectivity = await storage.load({
    key: ASYNC_STORAGE_KEYS.NETWORK_CONNECTIVITY,
  });
  if (connectivity == true) {
    return await updateRecord(DB_TABLE.SURVEY, payload, LocalId);
  } else {
    return await updateRecord(DB_TABLE.SURVEY, payload, LocalId);
  }
};

export const uploadSurveyToSalesforce = async survey => {
  let payload = {};
  for (const [key, value] of Object.entries(survey)) {
    if (value != null && key != 'IsLocallyCreated' && key != 'LocalId') {
      payload = { ...payload, [key]: value };
    }
  }
  return new Promise(async (resolve, reject) => {
    const response = await createSalesforceRecord(DB_TABLE.SURVEY, payload);
    if (response && response.id) {
      try {
        await markRecordNonDirty(DB_TABLE.SURVEY, survey.LocalId);
      } catch (error) {
        reject(error.message);
      }
      resolve(response.id);
    } else if (response && response.length > 0 && response[0].errorCode) {
      reject(response[0].message);
    } else {
      reject(i18n.t('SALESFORCE_OBJECT_CREATION_ERROR'));
    }
  });
};

export { getAllSurveysFromSalesforce };
