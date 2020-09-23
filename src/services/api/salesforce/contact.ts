import { getSalesforceRecords } from './core';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { prepareIdsForSalesforce, prepareIdsForSqllite } from '../../../utility';
import { saveRecordsOld, DB_TABLE, clearTable, getRecords, getAllRecords } from '../../database';
import { logger } from '../../../utility/logger';

const getLoggedInCDWContact = async () => {
  // @ts-ignore
  return await storage.load({
    key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
  });
};

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
