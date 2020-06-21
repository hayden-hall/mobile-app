import { getSalesforceRecords } from './SalesforceAPI';
import { clearTable, saveRecords, DB_TABLE } from '../../Database';

export const getCDWClientJunctionObjects = async cdwId => {
  const query = `SELECT Id,Child__c,Community_Development_Worker__c,Mother__c,Beneficiary_Name__c FROM CDW_Client_Junction__c WHERE Community_Development_Worker__c = '${cdwId}'`;
  const response = await getSalesforceRecords(query);
  await clearTable(DB_TABLE.CDW_JUNCTION);
  await saveRecords(DB_TABLE.CDW_JUNCTION, response.records);
  return response;
};
