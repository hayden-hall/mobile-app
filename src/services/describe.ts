import { describeLayoutResult, describeLayout, fetchSalesforceRecords } from './api/salesforce/core';
import { saveRecords, getAllRecords, getRecords, clearTable } from './database';

import { RecordType, PageLayoutSection, PageLayoutItem, Localization } from '../types/sqlite';
import { SurveyLayout } from '../types/survey';
import { DescribeLayoutResult, DescribeLayout, LocalizationCustomMetadata } from '../types/metadata';

import { logger } from '../utility/logger';
import { DB_TABLE } from '../constants';
import { SURVEY_OBJECT } from 'react-native-dotenv';
import i18n from '../config/i18n';

/**
 * @description Download record types, all the page layouts, and localization custom metadata.
 * @todo For surveys and contacts?
 */
export const retrieveAll = async () => {
  await clearTable(DB_TABLE.RecordType);
  await clearTable(DB_TABLE.PageLayoutSection);
  await clearTable(DB_TABLE.PageLayoutItem);
  await clearTable(DB_TABLE.Localization);

  const recordTypes = await storeRecordTypes();
  for (const rt of recordTypes) {
    await storePageLayoutItems(rt.recordTypeId);
  }
  await storeLocalization();
  await buildRecordTypeDictionary();
};

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
const storePageLayoutItems = async (recordTypeId: string) => {
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

/**
 * @description Retrieve Salesforce 'Localization__mdt' Custom Metadata records and save them to local database
 */
const storeLocalization = async () => {
  const query = 'SELECT Type__c, Locale__c, OriginalName__c, TranslatedLabel__c FROM Localization__mdt';
  const records: Array<LocalizationCustomMetadata> = await fetchSalesforceRecords(query);
  if (records.length === 0) {
    return;
  }
  const localizations: Array<Localization> = records.map(r => {
    return {
      locale: r.Locale__c,
      type: r.Type__c,
      name: r.OriginalName__c,
      label: r.TranslatedLabel__c,
    };
  });
  await saveRecords(DB_TABLE.Localization, localizations, false);
};

/**
 * @description Get all the record types of the survey object from local database
 */
export const getAllRecordTypes = async (): Promise<Array<RecordType>> => {
  const recordTypes: Array<RecordType> = await getAllRecords(DB_TABLE.RecordType);
  return recordTypes;
};

/**
 * Construct page layout object from locally stored page layout sections and items
 * @param layoutId
 */
export const buildLayoutDetail = async (layoutId: string): Promise<SurveyLayout> => {
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
  logger('FINE', 'buildLayoutDetail', items);

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
      title: s.sectionLabel,
      data: sectionIdToItems[s.id].map(item => ({
        name: item.fieldName,
        label: item.fieldLabel,
        type: item.fieldType,
      })),
    })),
  };

  return layout;
};

/**
 * @description [WIP] Build expo-localization object from locally stored tables
 */
export const buildRecordTypeDictionary = async () => {
  // record type (en)
  const recordTypes = await getAllRecordTypes();
  const enRecordTypes = recordTypes.reduce((result, current) => {
    result[`RECORD_TYPE_${current.name}`] = current.label;
    return result;
  }, {});
  // record type (translated). TODO: create localization table first.
  const translatedRecordTypes = await getRecords(DB_TABLE.Localization, "where type='RecordType'");
  const neRecordTypes = translatedRecordTypes.reduce((result, current) => {
    result[`RECORD_TYPE_${current.name}`] = current.label;
    return result;
  }, {});
  logger('DEBUG', 'buildRecordTypeDictionary', `ne:${Object.values(neRecordTypes).length}`);
  i18n.translations = {
    en: {
      ...i18n.translations.en,
      ...enRecordTypes,
    },
    ne: {
      ...i18n.translations.ne,
      ...neRecordTypes,
    },
  };
};
