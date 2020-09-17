import { describeLayoutResult, describeLayout } from './api/salesforce/core';
import { saveRecords, getAllRecords } from './database';

import { RecordType, PageLayoutSection, PageLayoutItem } from '../types/sqlite';
import { logger } from '../utility/logger';
import { DescribeLayoutResult, DescribeLayout } from '../types/metadata';

import { DB_TABLE } from '../constants';
import { SURVEY_OBJECT } from 'react-native-dotenv';

/**
 * @description Query record types by REST API (describe layouts) and save the results to local database.
 */
export const storeRecordTypes = async () => {
  const response: DescribeLayoutResult = await describeLayoutResult(SURVEY_OBJECT);
  const recordTypes: Array<RecordType> = response.recordTypeMappings
    .filter(r => r.active)
    .map(r => ({
      name: r.developerName,
      label: r.name,
      recordTypeId: r.recordTypeId,
      layoutId: r.layoutId,
    }));
  logger('DEBUG', 'storeRecordTypes', `${JSON.stringify(recordTypes)}`);
  await saveRecords(DB_TABLE.RecordType, recordTypes, false);

  return recordTypes;
};

/**
 * @description Query layouts and fields by Rest API (describe layout) and save the result to local database.
 * @param pageLayoutId
 */
export const storePageLayoutItems = async (pageLayoutId: string) => {
  const response: DescribeLayout = await describeLayout(SURVEY_OBJECT, pageLayoutId);
  const pageLayoutSections: Array<PageLayoutSection> = response.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => ({
      id: section.layoutSectionId,
      layoutId: pageLayoutId,
      sectionLabel: section.heading,
    }));
  logger('FINE', 'storePageLayoutItems | sections', pageLayoutSections);
  await saveRecords(DB_TABLE.PageLayoutSection, pageLayoutSections, false);

  const pageLayoutItems: Array<PageLayoutItem> = response.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => {
      return section.layoutRows.map(row => {
        return row.layoutItems.map(item => {
          return item.layoutComponents.map(c => {
            return {
              sectionId: section.layoutSectionId,
              fieldName: c.details.name,
              fieldLabel: c.details.label,
              fieldType: c.details.type,
            };
          });
        });
      });
    })
    .flat(3);
  logger('FINE', 'storePageLayoutItems | items', pageLayoutItems);
  await saveRecords(DB_TABLE.PageLayoutItem, pageLayoutItems, true);

  return response;
};

export const getAllRecordTypes = async () => {
  const recordTypes: Array<any> = await getAllRecords(DB_TABLE.RecordType);
  return recordTypes;
};
