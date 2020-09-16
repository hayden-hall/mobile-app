import { refreshAccessToken } from '../auth';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { logger } from '../../../utility/logger';
import { DescribeLayouts } from '../../../../src/types/metadata';

const SALESFORCE_API_VERSION = 'v45.0';

export const SALESFORCE_CREATE_OBJECT_NAME = {
  SURVEYS: 'Surveys',
};

export const getSalesforceRecords = async (query: string) => {
  try {
    const records = await fetchQuery(query);
    return records;
  } catch (error) {
    try {
      await refreshAccessToken();

      const records = await fetchQuery(query);
      return records;
    } catch (secondError) {
      logger('ERROR', 'getSalesforceRecords', secondError);
    }
  }
};

export const createSalesforceRecord = async (objectName, body) => {
  try {
    const result = await fetchInsert(objectName, body);
    return result;
  } catch (error) {
    try {
      await refreshAccessToken();

      const result = await fetchInsert(objectName, body);
      return result;
    } catch (secondError) {
      logger('ERROR', 'getSalesforceRecords', secondError);
    }
  }
};

const buildEndpointUrl = async () => {
  const instanceUrl = await storage.load({
    key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
  });
  return `${instanceUrl}/services/data/${SALESFORCE_API_VERSION}`;
};

const fetchQuery = async query => {
  const accessToken = await storage.load({
    key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
  });
  const endPoint = (await buildEndpointUrl()) + `/query?q=${query}`;
  logger('DEBUG', 'fetchQuery', endPoint);
  const response = await fetch(endPoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
};

const fetchInsert = async (objectName, record) => {
  const accessToken = await storage.load({
    key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
  });
  const endPoint = (await buildEndpointUrl()) + `/sobjects/${objectName}`;
  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(record),
  });
  return await response.json();
};

/**
 * Retrieve record type mappings or page layout information
 * @param sObjectType
 * @param pageLayoutId Salesforce Id of a page layout
 */
export const describeLayout = async (
  sObjectType: string,
  pageLayoutId: string
): Promise<DescribeLayouts> => {
  const accessToken = await storage.load({
    key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
  });
  const endPoint =
    (await buildEndpointUrl()) +
    `/sobjects/${sObjectType}/describe/layouts/${pageLayoutId ? pageLayoutId : ''}`;

  const response = await fetch(endPoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
};
