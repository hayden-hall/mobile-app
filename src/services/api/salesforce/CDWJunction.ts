import { getSalesforceRecords } from './core';
import { clearTable, saveRecordsOld, DB_TABLE } from '../../database';

export const getCDWClientJunctionObjects = async cdwId => {
  const query = `SELECT Id,Child__c,Community_Development_Worker__c,Mother__c,Beneficiary_Name__c FROM CDW_Client_Junction__c WHERE Community_Development_Worker__c = '${cdwId}'`;
  const response = await getSalesforceRecords(query);
  await clearTable(DB_TABLE.CDW_JUNCTION);
  await saveRecordsOld(DB_TABLE.CDW_JUNCTION, response.records);
  return response;
};
