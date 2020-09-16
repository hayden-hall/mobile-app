import * as SQLite from 'expo-sqlite';
import { logger } from '../utility/logger';
import { FieldTypeMapping } from '../types/sqlite';

const database = SQLite.openDatabase('AppDatabase.db');

const SURVEY_LOOKUP_FIELDS = [
  'Mother__c',
  'Child__c',
  'Beneficiary_Name__c',
  'Permanent_Record__c',
  'Record_Type_ID__c',
  'Family_Org_Name__c',
];

export const DB_TABLE = {
  SURVEY_METADATA: 'SurveyMetadata__c',
  SURVEY_SECTION: 'SurveySection__c',
  SURVEY_QUESTION: 'SurveyQuestion__c',
  CONTACT: 'contact',
  CDW_JUNCTION: 'CDW_Client_Junction__c',
  SURVEY: 'Survey__c',
  RECORD_TYPE: 'RecordType',
};

/**
 * @deprecated
 * @param table
 * @param records
 */
export const saveRecordsOld = (table, records) => {
  return new Promise(async (resolve, reject) => {
    const firstRecord = records[0];
    const fields = getDatabaseFields(firstRecord);

    //Check for table.
    await checkAndCreateTable(table, fields);

    //Prepare insert statement
    const sqlInsertStatement = prepareInsertStatement(table, records, fields);
    logger('DEBUG', 'Database Insert', sqlInsertStatement);

    try {
      database.transaction(tx => {
        tx.executeSql(sqlInsertStatement, null, (txn, result) => {
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const updateRecord = async (table, record, LocalId) => {
  return new Promise((resolve, reject) => {
    const fields = getDatabaseFields(record);
    //Prepare update statement
    const sqlUpdateStatement = prepareUpdateStatement(table, record, fields, LocalId);
    console.log('sqlUpdateStatement: ', sqlUpdateStatement);

    try {
      database.transaction(tx => {
        tx.executeSql(sqlUpdateStatement, null, (txn, result) => {
          resolve(true);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const saveRecordsWithFields = async (
  table: any,
  records: any,
  fieldsWithDataTypes: Array<any>
) => {
  return new Promise(async (resolve, reject) => {
    //Check for table.
    await checkAndCreateTableWithDataTypes(table, fieldsWithDataTypes);
    //Prepare insert statement
    const fields = fieldsWithDataTypes.map(fieldWithDataType => fieldWithDataType.split('#')[0]);
    const sqlInsertStatement = prepareInsertStatement(table, records, fields);
    logger('DEBUG', 'Database Insert', sqlInsertStatement);
    try {
      database.transaction(tx => {
        tx.executeSql(sqlInsertStatement, null, (txn, result) => {
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const getRecords = (table, whereQuery): Promise<Array<any>> => {
  return new Promise((resolve, reject) => {
    const sqlStatement = `SELECT * FROM ${table} ${whereQuery || ''}`;
    try {
      database.transaction(tx => {
        tx.executeSql(
          sqlStatement,
          [],
          (txn, result) => {
            const rows = result.rows as any;
            resolve(rows._array);
          },
          () => {
            resolve([]);
            return true;
          }
        );
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const markRecordNonDirty = (table, LocalId) => {
  return new Promise((resolve, reject) => {
    const sqlStatement = `UPDATE ${table} SET IsLocallyCreated = 0 WHERE LocalId = ${LocalId}`;
    try {
      database.transaction(tx => {
        tx.executeSql(sqlStatement, [], (txn, result) => {
          resolve(true);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const deleteRecord = (table, LocalId) => {
  return new Promise((resolve, reject) => {
    const sqlStatement = `DELETE FROM ${table} WHERE LocalId = ${LocalId}`;
    try {
      database.transaction(tx => {
        tx.executeSql(sqlStatement, [], (txn, result) => {
          resolve(true);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const clearTable = table => {
  return new Promise((resolve, reject) => {
    const sqlStatement = `DROP TABLE IF EXISTS ${table};`;
    try {
      database.transaction(tx => {
        tx.executeSql(sqlStatement, [], (txn, result) => {
          resolve(true);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const clearDatabase = async () => {
  for (const [key, value] of Object.entries(DB_TABLE)) {
    await clearTable(value);
  }
};

/**
 * @description private function to generate insert statement
 * @param table
 * @param records
 * @param fields
 */
const prepareInsertStatement = (table, records, fields) => {
  const valuesArray = [];
  records.forEach(record => {
    const values = [];
    fields.forEach(field => {
      values.push(`"${record[field]}"`);
    });
    valuesArray.push(`(${values.join(',')})`);
  });

  const keys = fields.join(',');
  return `insert into ${table} (${keys}) values ${valuesArray.join(',')}`;
};

const prepareUpdateStatement = (table, record, fields, LocalId) => {
  const pairArray = [];
  fields.forEach(field => {
    //Leave as it is for lookup fields
    if (!SURVEY_LOOKUP_FIELDS.includes(field)) {
      pairArray.push(`${field}="${record[field]}"`);
    }
  });
  return `UPDATE ${table} SET ${pairArray.join(',')} WHERE LocalId = ${LocalId}`;
};

const getDatabaseFields = record => {
  const keys = [];
  for (const [key, value] of Object.entries(record)) {
    if (typeof value != 'object' || value == null) {
      keys.push(key);
    }
  }
  return keys;
};

const checkAndCreateTable = (table, fields) => {
  return new Promise((resolve, reject) => {
    let fieldsWithType = fields.map(field => `${field} TEXT`).join(',');
    fieldsWithType = `${fieldsWithType}, IsLocallyCreated INTEGER DEFAULT 0`;
    fieldsWithType = `${fieldsWithType}, LocalId INTEGER PRIMARY KEY AUTOINCREMENT`;
    try {
      database.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${table}( ${fieldsWithType});`,
          [],
          (txn, result) => {
            resolve(database);
          }
        );
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const checkAndCreateTableWithDataTypes = (table, fieldsWithDataType) => {
  return new Promise((resolve, reject) => {
    let fieldsWithType = fieldsWithDataType
      .map(field => `${field.split('#')[0]} ${field.split('#')[1]}`)
      .join(',');
    fieldsWithType = `${fieldsWithType}, IsLocallyCreated INTEGER DEFAULT 0`;
    fieldsWithType = `${fieldsWithType}, LocalId INTEGER PRIMARY KEY AUTOINCREMENT`;
    try {
      database.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${table}( ${fieldsWithType});`,
          [],
          (txn, result) => {
            resolve(database);
          }
        );
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

/**
 * @description Create table if not exists, given table name and field type mappings. 'name' field or 'localId' field will be primary.
 * @param fieldName Name of table on sqlite
 * @param fieldTypeMappings Array of field type mapping
 * @param hasLocalId
 */
export const prepareTable = (
  tableName: string,
  fieldTypeMappings: Array<FieldTypeMapping>,
  hasLocalId: boolean
) => {
  return new Promise((resolve, reject) => {
    const fieldsWithType = fieldTypeMappings
      .map(field => {
        if (field.name === 'name') {
          return `${field.name} ${field.type} primary key`;
        } else {
          return `${field.name} ${field.type}`;
        }
      })
      .join(',');
    const localId = 'localId integer primary key autoincrement';
    const fieldsInStatement = hasLocalId ? `${localId},${fieldsWithType}` : fieldsWithType;

    try {
      database.transaction(tx => {
        tx.executeSql(`create table if not exists ${tableName} (${fieldsInStatement});`, [], () => {
          resolve(database);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

/**
 * @description Returns mappings of sqlite field name and type given record
 * e.g., {field1: 'hello', field2: 123} => [{field: 'field1', type: 'text', field: 'field2', type: 'integer'}]
 * @param record
 */
const getFieldTypeMappings = (record: Record<string, any>): Array<FieldTypeMapping> => {
  const result: Array<FieldTypeMapping> = [];
  for (const [name, value] of Object.entries(record)) {
    let type;
    if (typeof value === 'number' || typeof value === 'boolean') {
      type = 'integer';
    } else {
      type = 'text';
    }
    result.push({
      name,
      type,
    });
  }
  return result;
};

/**
 * @description Save records to the local sqlite table
 * @param tableName Name of table on local sqlite
 * @param records
 * @param hasLocalId
 */
export const saveRecords = (tableName: string, records, hasLocalId) => {
  return new Promise(async (resolve, reject) => {
    const fieldTypeMappings: Array<FieldTypeMapping> = getFieldTypeMappings(records[0]);
    await prepareTable(tableName, fieldTypeMappings, hasLocalId);

    const keys = fieldTypeMappings.map(field => field.name).join(','); // e.g., 'developerName', 'recordTypeId', ...
    const values = records.map(r => `(${Object.values(r).join(',')})`).join(','); // e.g,  ('a1', 'b2'), ('c1', 'd2')
    const statement = `insert into ${tableName} (${keys}) values ${values}`;
    logger('DEBUG', 'saveRecords', statement);

    try {
      database.transaction(tx => {
        tx.executeSql(statement, null, (txn, result) => {
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
