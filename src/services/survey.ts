import { fetchSalesforceRecords } from './api/salesforce/core';
import { updateRecord, updateFieldValue, clearTable, getAllRecords, saveRecords } from './database';
import { ASYNC_STORAGE_KEYS, DB_TABLE } from '../constants';
import { PageLayoutItem } from '../types/sqlite';
import { logger } from '../utility/logger';

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo Use constants
 */
export const storeOnlineSurveys = async () => {
  // Build field list from page layout items
  const fields: Array<PageLayoutItem> = await getAllRecords(DB_TABLE.PageLayoutItem);
  const fieldSet = new Set(fields.map(f => f.fieldName));
  fieldSet.add('Name');
  fieldSet.add('RecordTypeId');
  const commaSeparetedFields = Array.from(fieldSet).join(',');

  const areaCode = await storage.load({
    key: ASYNC_STORAGE_KEYS.AREA_CODE,
  });
  const surveys = await fetchSalesforceRecords(
    `SELECT ${commaSeparetedFields} FROM Survey__c WHERE Area_Code__c = '${areaCode}'`
  );
  clearTable('Survey');
  // Surveys should have sync status and local id for offline surveys
  saveRecords(
    'Survey',
    surveys.map(s => ({ ...s, syncStatus: 'Synced', title: s.Name })),
    undefined
  );
};

/**
 * @description Create a new survey in local database
 * @param survey
 */
export const upsertLocalSurvey = async survey => {
  // remove state
  delete survey.disabled;
  logger('DEBUG', 'Saving survey', survey);
  if (survey.localId) {
    return await updateRecord(DB_TABLE.SURVEY, survey, `where localId = ${survey.localId}`);
  }
  return await saveRecords(DB_TABLE.SURVEY, [survey], undefined);
};

/**
 * @description Upload surveys to salesforce
 * @param surveys
 */
export const uploadSurveyListToSalesforce = async surveys => {
  logger('DEBUG', 'Upload to Salesforce (local)', surveys);
  const records = surveys.map(s => {
    // Remove local or read only fields
    delete s.localId;
    delete s.syncStatus;
    delete s.Name;
    return s;
  });
  logger('DEBUG', 'Upload to Salesforce', records);
  // return await createSalesforceRecords('Survey__c', records);
};

/**
 * updateSurveyStatusSynced
 * @param surveys
 */
export const updateSurveyStatusSynced = async surveys => {
  const commaSeparetedLocalIds = surveys.map(s => `'${s.localId}'`).join(',');
  return await updateFieldValue(
    DB_TABLE.SURVEY,
    'syncStatus',
    'Synced',
    `where localId IN (${commaSeparetedLocalIds})`
  );
};
