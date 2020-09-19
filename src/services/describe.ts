import { describeLayoutResult, describeLayout } from './api/salesforce/core';
import { saveRecords, getAllRecords, getRecords } from './database';

import { RecordType, PageLayoutSection, PageLayoutItem } from '../types/sqlite';
import { SurveyLayout } from '../types/survey';
import { DescribeLayoutResult, DescribeLayout } from '../types/metadata';

import { logger } from '../utility/logger';
import { DB_TABLE } from '../constants';
import { SURVEY_OBJECT } from 'react-native-dotenv';

/**
 * @description Query record types by REST API (describe layouts) and save the results to local database.
 */
export const storeRecordTypes = async () => {
  const response: DescribeLayoutResult = await describeLayoutResult(SURVEY_OBJECT);
  const recordTypes: Array<RecordType> = response.recordTypeMappings
    .filter(r => r.active && r.name !== 'Master') // TODO: For single record type and navigation
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
 * @param recordTypeId
 */
export const storePageLayoutItems = async (recordTypeId: string) => {
  const response: DescribeLayout = await describeLayout(SURVEY_OBJECT, recordTypeId);
  const pageLayoutSections: Array<PageLayoutSection> = response.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => ({
      id: section.layoutSectionId,
      layoutId: section.parentLayoutId,
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

export const getAllRecordTypes = async (): Promise<Array<RecordType>> => {
  const recordTypes: Array<RecordType> = await getAllRecords(DB_TABLE.RecordType);
  return recordTypes;
};

/**
 * Construct page layout object from locally stored page layout sections and items
 * @param layoutId
 */
export const getLayoutDetail = async (layoutId: string): Promise<SurveyLayout> => {
  // sections in the layout
  const sections: Array<PageLayoutSection> = await getRecords(
    DB_TABLE.PageLayoutSection,
    `where layoutId='${layoutId}'`
  );
  // items used in the sections
  const sectionIds = sections.map(s => s.id);
  const items: Array<PageLayoutItem> = await getRecords(
    DB_TABLE.PageLayoutItem,
    `where sectionId in (${sectionIds.map(id => `'${id}'`).join(',')})`
  );
  logger('FINE', 'getLayoutDetail', items);

  // group items by section id
  const sectionIdToItems = items.reduce(
    (result, item) => ({
      ...result,
      [item.sectionId]: [...(result[item.sectionId] || []), item],
    }),
    {}
  );

  const layout: SurveyLayout = {
    sections: sections.map(s => ({
      id: s.id,
      label: s.sectionLabel,
      items: sectionIdToItems[s.id].map(item => ({
        name: item.fieldName,
        label: item.fieldLabel,
        type: item.fieldType,
      })),
    })),
  };

  return layout;
};
