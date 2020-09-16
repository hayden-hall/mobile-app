import { describeLayout } from './api/salesforce/core';
import { saveRecords } from './database';

import { RecordType } from '../types/sqlite';
import { logger } from '../utility/logger';

/**
 * Query record types by REST API (describe layouts) and save the results to local database.
 * @param sObjectType
 */
export const storeRecordTypeListBySObjectType = async (sObjectType: string) => {
  const response = await describeLayout(sObjectType, undefined);
  const recordTypes: Array<RecordType> = response.recordTypeMappings
    .filter(r => r.active)
    .map(r => ({
      developerName: r.developerName,
      name: r.name,
      recordTypeId: r.recordTypeId,
      layoutId: r.layoutId,
    }));
  logger('DEBUG', 'storeRecordTypeListBySObjectType', `${JSON.stringify(recordTypes)}`);

  saveRecords('RecordType', recordTypes);
  return response;
};
