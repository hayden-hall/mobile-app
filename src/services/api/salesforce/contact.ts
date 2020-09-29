import { fetchSalesforceRecords, getSalesforceRecords } from './core';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { prepareIdsForSalesforce, prepareIdsForSqllite } from '../../../utility';
import { saveRecordsOld, DB_TABLE, clearTable, getRecords, getAllRecords, saveRecords } from '../../database';
import { logger } from '../../../utility/logger';
import { Contact } from '../../../types/sqlite';

const getLoggedInCDWContact = async () => {
  return await storage.load({
    key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
  });
};

/**
 * @description Fetch contacts, resolve relationships and then save them to local database.
 * @param appUserId contact Id of community development worker
 */
export const storeContacts = async () => {
  await clearTable(DB_TABLE.CONTACT);
  const appUserId = await getLoggedInCDWContact();
  const junctionQuery = `SELECT Id, Child__c, Child__r.Name, Mother__c, Mother__r.Name, Mother__r.Ante_Natal_Mother__c, Beneficiary_Name__c, Beneficiary_Name__r.Name
    FROM CDW_Client_Junction__c
    WHERE Community_Development_Worker__c = '${appUserId}'`;
  const junctionRecords = await fetchSalesforceRecords(junctionQuery);
  const contacts: Array<Contact> = junctionRecords
    .map(junctionRecord => {
      if (junctionRecord.Child__c) {
        return {
          id: junctionRecord.Child__c,
          name: junctionRecord.Child__r.Name,
          type: 'Child',
          motherId: junctionRecord.Mother__c || '',
          userId: appUserId,
        };
      } else if (junctionRecord.Mother__c && !junctionRecord.Mother__r.Ante_Natal_Mother__c) {
        return { id: junctionRecord.Mother__c, name: junctionRecord.Mother__r.Name, type: 'Mother', userId: appUserId };
      } else if (junctionRecord.Mother__c && junctionRecord.Mother__r.Ante_Natal_Mother__c) {
        return {
          id: junctionRecord.Mother__c,
          name: junctionRecord.Mother__r.Name,
          type: 'AnteNatelMother',
          userId: appUserId,
        };
      } else if (junctionRecord.Beneficiary__c) {
        return {
          id: junctionRecord.Beneficiary_Name__c,
          name: junctionRecord.Beneficiary_Name__r.Name,
          type: 'Beneficiary',
          userId: appUserId,
        };
      }
      return undefined;
    })
    .filter(r => r !== undefined);

  logger('DEBUG', 'storeContacts', contacts);
  await saveRecords(DB_TABLE.CONTACT, contacts, 'id');
};

/**
 * @description Get contacts by type
 * @param type Contact type (Mother, Child, Beneficiary, AnteNatalMother)
 */
export const getContactByType = async (type: string) => {
  return await getRecords(DB_TABLE.CONTACT, `where type='${type}'`);
};

/**
 * @description Fetch contact by area code.
 * @param areaCode area code entered in area code screen
 */
const getCDWContact = async areaCode => {
  const query = `SELECT Id, Name, Service_Role__c FROM contact WHERE Area_Code__c='${areaCode}' AND Service_Role__c = 'Health Worker'`;
  const response = await getSalesforceRecords(query);
  logger('DEBUG', 'Contact API', `${JSON.stringify(response)}`);
  return response;
};

const getLoggedInUserMothersChilds = async contactsIds => {
  const ids = prepareIdsForSalesforce(contactsIds);
  const query = `SELECT Id,Name,Address_Locator__c,FirstName,LastName,Ante_natal_Mother__c FROM contact WHERE Id IN (${ids})`;
  const response = await getSalesforceRecords(query);
  await clearTable(DB_TABLE.CONTACT);
  await saveRecordsOld(DB_TABLE.CONTACT, response.records);
  return response;
};

const getBeneficiaries = async () => {
  const CDWRecords = await getAllRecords(DB_TABLE.CDW_JUNCTION);

  const beneficiariesIds = CDWRecords.map(cdwRecord => cdwRecord.Beneficiary_Name__c);

  const beneIdsForSql = prepareIdsForSqllite(beneficiariesIds);

  return await getRecords(DB_TABLE.CONTACT, `WHERE Id IN (${beneIdsForSql})`);
};

const getMothers = async () => {
  const CDWRecords = await getAllRecords(DB_TABLE.CDW_JUNCTION);

  const mothersIds = CDWRecords.map(cdwRecord => cdwRecord.Mother__c);

  const motherIdsForSql = prepareIdsForSqllite(mothersIds);

  return await getRecords(DB_TABLE.CONTACT, `WHERE Id IN (${motherIdsForSql})`);
};

const getAnteNatalMothers = async () => {
  const CDWRecords = await getAllRecords(DB_TABLE.CDW_JUNCTION);

  const mothersIds = CDWRecords.map(cdwRecord => cdwRecord.Mother__c);

  const motherIdsForSql = prepareIdsForSqllite(mothersIds);

  // eslint-disable-next-line prettier/prettier
  return await getRecords(
    DB_TABLE.CONTACT,
    `WHERE Id IN (${motherIdsForSql}) AND Ante_natal_Mother__c = 'true'`
  );
};

const getChildsForMother = async motherId => {
  const CDWRecords = await getRecords(DB_TABLE.CDW_JUNCTION, `WHERE Mother__c = "${motherId}"`);

  const childIds = CDWRecords.map(cdwRecord => cdwRecord.Child__c);

  const childIdsForSql = prepareIdsForSqllite(childIds);

  return await getRecords(DB_TABLE.CONTACT, `WHERE Id IN (${childIdsForSql})`);
};

const getAllOfflineContacts = async () => {
  return await getAllRecords(DB_TABLE.CONTACT);
};

export {
  getCDWContact,
  getLoggedInCDWContact,
  getLoggedInUserMothersChilds,
  getAllOfflineContacts,
  getChildsForMother,
  getMothers,
  getAnteNatalMothers,
  getBeneficiaries,
};
