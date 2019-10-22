import { getDataFromQuery } from './SalesforceAPI';
import AsyncStorage from '@react-native-community/async-storage';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import {
  prepareIdsForSalesforce,
  prepareIdsForSqllite
} from '../../../utility';
import { saveRecords, DB_TABLE, clearTable, getRecords } from '../../Database';

const getLoggedInCDWContact = async () => {
  return await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.CDW_WORKED_ID);
};

const getCDWContact = async areaCode => {
  //TODO://const query = `SELECT Id,Name,Service_Role__c FROM contact WHERE Area_Code__c='${areaCode}' AND Active__c = true AND Service_Role__c = 'Health Worker'`;
  const query = `SELECT Id,Name,Service_Role__c FROM contact WHERE Area_Code__c='${areaCode}' AND Service_Role__c = 'Health Worker'`;
  const response = await getDataFromQuery(query);
  return response;
};

const getLoggedInUserMothersChilds = async contactsIds => {
  const ids = prepareIdsForSalesforce(contactsIds);
  const query = `SELECT Id,Name,Address_Locator__c,FirstName,LastName FROM contact WHERE Id IN (${ids})`;
  const response = await getDataFromQuery(query);
  await clearTable(DB_TABLE.CONTACT);
  await saveRecords(DB_TABLE.CONTACT, response.records);
  return response;
};

const getBeneficiaries = async () => {
  const CDWRecords = await getRecords(DB_TABLE.CDW_JUNCTION, '');

  const beneficiariesIds = CDWRecords.map(
    cdwRecord => cdwRecord.Beneficiary_Name__c
  );

  const beneIdsForSql = prepareIdsForSqllite(beneficiariesIds);

  return await getRecords(DB_TABLE.CONTACT, `WHERE Id IN (${beneIdsForSql})`);
};

const getMothers = async () => {
  const CDWRecords = await getRecords(DB_TABLE.CDW_JUNCTION, '');

  const mothersIds = CDWRecords.map(cdwRecord => cdwRecord.Mother__c);

  const motherIdsForSql = prepareIdsForSqllite(mothersIds);

  return await getRecords(DB_TABLE.CONTACT, `WHERE Id IN (${motherIdsForSql})`);
};

const getChildsForMother = async motherId => {
  const CDWRecords = await getRecords(
    DB_TABLE.CDW_JUNCTION,
    `WHERE Mother__c = "${motherId}"`
  );

  const childIds = CDWRecords.map(cdwRecord => cdwRecord.Child__c);

  const childIdsForSql = prepareIdsForSqllite(childIds);

  return await getRecords(DB_TABLE.CONTACT, `WHERE Id IN (${childIdsForSql})`);
};

const getAllOfflineContacts = async () => {
  return await getRecords(DB_TABLE.CONTACT, '');
};

export {
  getCDWContact,
  getLoggedInCDWContact,
  getLoggedInUserMothersChilds,
  getAllOfflineContacts,
  getChildsForMother,
  getMothers,
  getBeneficiaries
};
