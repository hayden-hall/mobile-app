import * as SQLite from 'expo-sqlite';

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
};

export const saveRecords = (table, records) => {
  return new Promise(async (resolve, reject) => {
    const firstRecord = records[0];
    const fields = getDatabaseFields(firstRecord);

    //Check for table.
    await checkAndCreateTable(table, fields);

    //Prepare insert statement
    const sqlInsertStatement = prepareInsertStatement(table, records, fields);
    console.log('sqlInsertStatement: ', sqlInsertStatement);

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
    console.log('sqlInsertStatement: ', sqlInsertStatement);
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
  return `INSERT INTO ${table} (${keys}) VALUES ${valuesArray.join(',')}`;
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
