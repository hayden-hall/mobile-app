import { describeLayout } from './api/salesforce/core';
import { saveRecords } from './database';

import { RecordType } from '../types/sqlite';
import { logger } from '../utility/logger';

/**
 * @description Query record types by REST API (describe layouts) and save the results to local database.
 * @param sObjectType
 */
export const storeRecordTypeList = async (sObjectType: string) => {
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

  saveRecords('RecordType', recordTypes);
  return response;
};

/**
 * @description Query layout by Rest API (describe layout) and save the result to local database.
 * @param sObjectType
 * @param pageLayoutId
 */
export const storePageLayout = async (sObjectType: string) => {
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

  saveRecords('RecordType', recordTypes);
  return response;
};
