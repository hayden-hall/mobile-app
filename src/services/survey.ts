/* eslint-disable @typescript-eslint/camelcase */
import { createSalesforceRecord, fetchSalesforceRecords } from './api/salesforce/core';
import {
  saveRecordsOld,
  updateRecord,
  clearTable,
  getAllRecords,
  saveRecords,
  updateSurveyStatusSynced,
} from './database';
import { ASYNC_STORAGE_KEYS, DB_TABLE } from '../constants';
import i18n from '../config/i18n';
import { PageLayoutItem } from '../types/sqlite';

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
  const fields: Array<PageLayoutItem> = await getAllRecords(DB_TABLE.PageLayoutItem);
  const commaSeparetedFields = Array.from(new Set(fields.map(f => f.fieldName))).join(',');

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
    surveys.map(s => ({ ...s, syncStatus: 'Synced' })),
    undefined
  );
};

/**
 * @description Create a new survey in local database
 * @param survey
 */
export const createLocalSurvey = async survey => {
  const payload = { ...survey, syncStatus: 'Unsynced' };
  return await saveRecords(DB_TABLE.SURVEY, [payload], undefined);
};

export const createNewSurvey = async survey => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  return await saveRecordsOld(DB_TABLE.SURVEY, [payload]);
};

export const updateSurvey = async (survey, LocalId) => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  return await updateRecord(DB_TABLE.SURVEY, payload, LocalId);
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
        await updateSurveyStatusSynced(survey.localId);
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
