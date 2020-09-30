import * as SQLite from 'expo-sqlite';
import { logger } from '../utility/logger';
import { FieldTypeMapping } from '../types/sqlite';
import { DB_TABLE } from '../constants';

const database = SQLite.openDatabase('AppDatabase.db');

const SURVEY_LOOKUP_FIELDS = [
  'Mother__c',
  'Child__c',
  'Beneficiary_Name__c',
  'Permanent_Record__c',
  'Record_Type_ID__c',
  'Family_Org_Name__c',
];

/**
 * @description Get all the records from a local table
 * @param tableName
 */
export const getAllRecords = (tableName: string) => {
  return new Promise<Array<any>>(async (resolve, reject) => {
    const statement = `select * from ${tableName}`;
    logger('DEBUG', 'getAllRecords', statement);

    executeTransaction(statement)
      .then(result => {
        resolve(result.rows._array);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Get all the records from a local table and run callback method using result array as argument
 * @param tableName
 * @param onSuccess callback method
 */
export const getAllRecordsWithCallback = (tableName: string, onSuccess) => {
  return new Promise(async (resolve, reject) => {
    database.transaction(
      txn => {
        txn.executeSql(`select * from ${tableName}`, [], (_, { rows: { _array } }) => {
          onSuccess(_array);
          resolve(true);
        });
      },
      error => {
        logger('ERROR', 'getAllRecordsWithCallback', error);
        reject(error);
      }
    );
  });
};

/**
 * @description Get records from a local table with condition
 * @param tableName
 * @param whereClause Required.
 */
export const getRecords = (tableName, whereClause): Promise<Array<any>> => {
  return new Promise<Array<any>>(async (resolve, reject) => {
    if (!whereClause) {
      reject('Specify where clause or use "getAllRecords" instead.');
    }
    const statement = `select * from ${tableName} ${whereClause}`;
    logger('DEBUG', 'getAllRecords', statement);

    executeTransaction(statement)
      .then(result => {
        resolve(result.rows._array);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Save records to the local sqlite table
 * @param tableName Name of table on local sqlite
 * @param records
 * @param primaryKey
 */
export const saveRecords = (tableName: string, records, primaryKey: string) => {
  return new Promise(async (resolve, reject) => {
    const fieldTypeMappings: Array<FieldTypeMapping> = getFieldTypeMappings(records[0]);
    await prepareTable(tableName, fieldTypeMappings, primaryKey);

    const keys = fieldTypeMappings.map(field => field.name).join(','); // e.g., 'developerName', 'recordTypeId', ...
    const values = records
      .map(record => {
        return convertValueToSQLite(record);
      })
      .join(','); // e.g., ('a1', 'b2'), ('c1', 'd2')
    const statement = `insert into ${tableName} (${keys}) values ${values}`;
    logger('FINE', 'saveRecords', statement);

    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
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

/**
 * @description Update survey sync status to 'Synced'. Us
 * @param localId
 */
export const updateSurveyStatusSynced = localId => {
  return new Promise((resolve, reject) => {
    const statement = `update survey syncStatus = 'Synced' where localId = ${localId}`;

    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Delete a record in local table
 * @param tableName
 * @param LocalId
 */
export const deleteRecord = (tableName, LocalId) => {
  return new Promise((resolve, reject) => {
    const sqlStatement = `DELETE FROM ${tableName} WHERE LocalId = ${LocalId}`;
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

/**
 * @description Create table if not exists, given table name and field type mappings. 'name', 'id' or 'localId' field will be primary.
 * @param fieldName Name of table on sqlite
 * @param fieldTypeMappings Array of field type mapping
 * @param primaryKey Field name of primary key
 */
export const prepareTable = (tableName: string, fieldTypeMappings: Array<FieldTypeMapping>, primaryKey: string) => {
  return new Promise((resolve, reject) => {
    const fieldsWithType = fieldTypeMappings
      .map(field => {
        if (field.name === primaryKey) {
          return `${field.name} ${field.type} primary key`;
        } else {
          return `${field.name} ${field.type}`;
        }
      })
      .join(',');
    const localId = 'localId integer primary key autoincrement';
    const fieldsInStatement = !primaryKey ? `${localId},${fieldsWithType}` : fieldsWithType;
    logger('DEBUG', 'prepareTable', `create table if not exists ${tableName} (${fieldsInStatement});`);

    executeTransaction(`create table if not exists ${tableName} (${fieldsInStatement});`)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
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
      // string
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
 * @description Convert values of a record into sqlite supported formated string for dml statement
 * @param record
 * @param fieldTypeMappings
 * @example { name: 'Hello', id: 1} => ('Hello', 1)
 */
const convertValueToSQLite = (record): string => {
  const values = Object.entries(record).map(([key, value]) => {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    } else if (typeof value === 'boolean') {
      return value ? 1 : 0; // 1: true, 0: false
    }
    return value;
  });
  return `(${values})`;
};

/**
 * @description Drop all the local tables
 */
export const clearDatabase = async () => {
  logger('DEBUG', 'clearDatabase', 'Deleting all the tables');
  for (const [key, value] of Object.entries(DB_TABLE)) {
    await clearTable(value);
  }
};

/**
 * @description Drop table
 * @param tableName
 */
export const clearTable = (tableName: string) => {
  return new Promise((resolve, reject) => {
    logger('DEBUG', 'clearTable', `Deleting ${tableName}`);
    const statement = `DROP TABLE IF EXISTS ${tableName};`;

    executeTransaction(statement)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * @description Wrapper private (async) function to execute sql statement.
 * @param statement
 */
const executeTransaction = (statement: string) => {
  return new Promise<SQLite.SQLResultSet>((resolve, reject) => {
    try {
      database.transaction(tx => {
        tx.executeSql(
          statement,
          null,
          (txn, result) => {
            logger('FINE', 'sqlite', 'success');
            resolve(result);
          },
          (txn, error) => {
            logger('ERROR', 'sqlite', `${JSON.stringify(error)} ${JSON.stringify(txn)}`);
            reject(error);
            return false;
          }
        );
      });
    } catch (error) {
      logger('ERROR', 'sqlite', error);
      reject(error);
    }
  });
};

// --------------------- Deprecated methods below -------------------------

/**
 * @deprecated
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

/**
 * @deprecated
 * @param table
 * @param record
 * @param fields
 * @param LocalId
 */
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

/**
 * @deprecated
 * @param table
 * @param records
 * @param fieldsWithDataTypes
 */
export const saveRecordsWithFields = async (table: any, records: any, fieldsWithDataTypes: Array<any>) => {
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

/**
 * @deprecated
 * @param table
 * @param fields
 */
const checkAndCreateTable = (table, fields) => {
  return new Promise((resolve, reject) => {
    let fieldsWithType = fields.map(field => `${field} TEXT`).join(',');
    fieldsWithType = `${fieldsWithType}, IsLocallyCreated INTEGER DEFAULT 0`;
    fieldsWithType = `${fieldsWithType}, LocalId INTEGER PRIMARY KEY AUTOINCREMENT`;
    try {
      database.transaction(tx => {
        tx.executeSql(`CREATE TABLE IF NOT EXISTS ${table}( ${fieldsWithType});`, [], (txn, result) => {
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
 * @deprecated
 * @param table
 * @param fieldsWithDataType
 */
const checkAndCreateTableWithDataTypes = (table, fieldsWithDataType) => {
  return new Promise((resolve, reject) => {
    let fieldsWithType = fieldsWithDataType.map(field => `${field.split('#')[0]} ${field.split('#')[1]}`).join(',');
    fieldsWithType = `${fieldsWithType}, IsLocallyCreated INTEGER DEFAULT 0`;
    fieldsWithType = `${fieldsWithType}, LocalId INTEGER PRIMARY KEY AUTOINCREMENT`;
    try {
      database.transaction(tx => {
        tx.executeSql(`CREATE TABLE IF NOT EXISTS ${table}( ${fieldsWithType});`, [], (txn, result) => {
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
 * @deprecated
 * @param record
 */
const getDatabaseFields = record => {
  const keys = [];
  for (const [key, value] of Object.entries(record)) {
    if (typeof value != 'object' || value == null) {
      keys.push(key);
    }
  }
  return keys;
};
