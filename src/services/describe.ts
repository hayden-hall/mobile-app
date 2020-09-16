import { describeLayout } from './api/salesforce/core';
import { saveRecords } from './database';

import { RecordType } from '../types/sqlite';
import { logger } from '../utility/logger';

/**
 * @description Query record types by REST API (describe layouts) and save the results to local database.
 * @param sObjectType
 */
export const storeRecordTypes = async (sObjectType: string) => {
  const response = await describeLayout(sObjectType, undefined);
  const recordTypes: Array<RecordType> = response.recordTypeMappings
    .filter(r => r.active)
    .map(r => ({
      developerName: r.developerName,
      name: r.name,
      recordTypeId: r.recordTypeId,
      layoutId: r.layoutId,
    }));
  logger('DEBUG', 'storeRecordTypeList', `${JSON.stringify(recordTypes)}`);

  saveRecords('RecordType', recordTypes, false);
  return response;
};

/**
 * @description Query layouts and fields by Rest API (describe layout) and save the result to local database.
 * @param sObjectType
 * @param pageLayoutId
 */
export const storePageLayoutItems = async (sObjectType: string) => {
  const response = await describeLayout(sObjectType, undefined);
  const recordTypes: Array<RecordType> = response.recordTypeMappings
    .filter(r => r.active)
    .map(r => ({
      name: r.developerName,
      label: r.name,
      recordTypeId: r.recordTypeId,
      layoutId: r.layoutId,
    }));
  logger('DEBUG', 'storePageLayoutItems', `${JSON.stringify(recordTypes)}`);

  saveRecords('PageLayoutItem', recordTypes, true);
  return response;
};
