import { createSalesforceRecord, createSalesforceRecords, fetchSalesforceRecords } from './api/salesforce/core';
import { saveRecordsOld, updateRecord, clearTable, getAllRecords, saveRecords, updateRecords } from './database';
import { ASYNC_STORAGE_KEYS, DB_TABLE } from '../constants';
import { PageLayoutItem } from '../types/sqlite';

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo Use constants
 */
export const storeOnlineSurveys = async () => {
  // Build field list from page layout items
  const fields: Array<PageLayoutItem> = await getAllRecords(DB_TABLE.PageLayoutItem);
  const fieldSet = new Set(fields.map(f => f.fieldName));
  fieldSet.add('Name');
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
export const createLocalSurvey = async survey => {
  const payload = { ...survey, syncStatus: 'Unsynced', title: 'Local Survey' };
  return await saveRecords(DB_TABLE.SURVEY, [payload], undefined);
};

/**
 * @description Upload surveys to salesforce
 * @param surveys
 */
export const uploadSurveyListToSalesforce = async surveys => {
  return await createSalesforceRecords('Survey__c', surveys);
};

/**
 * updateSurveyStatusSynced
 * @param surveys
 */
export const updateSurveyStatusSynced = async surveys => {
  const commaSeparetedLocalIds = surveys.map(s => `'${s.localId}'`).join(',');
  return await updateRecords(DB_TABLE.SURVEY, "syncStatus = 'Synced'", `where localId IN (${commaSeparetedLocalIds})`);
};

// --------------- deprecated methods below ----------------

/**
 * @deprecated
 * @param survey
 */
export const createNewSurvey = async survey => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  return await saveRecordsOld(DB_TABLE.SURVEY, [payload]);
};

/**
 * @deprecated
 * @param survey
 * @param LocalId
 */
export const updateSurvey = async (survey, LocalId) => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  return await updateRecord(DB_TABLE.SURVEY, payload, LocalId);
};

/**
 * @description
 * @param survey
 */
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
        await updateSurveyStatusSynced(survey.localId);
      } catch (error) {
        reject(error.message);
      }
      resolve(response.id);
    } else if (response && response.length > 0 && response[0].errorCode) {
      reject(response[0].message);
    } else {
      reject('SALESFORCE_OBJECT_CREATION_ERROR');
    }
  });
};
