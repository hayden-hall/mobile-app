import { SQLite } from 'expo-sqlite';

const databaseName = 'AppDatabase.db';
let database = undefined;
const SURVEY_LOOKUP_FIELDS = [
  'Mother__c',
  'Child__c',
  'Beneficiary_Name__c',
  'Permanent_Record__c',
  'Record_Type_ID__c',
  'Family_Org_Name__c'
];

export const DB_TABLE = {
  SURVEY_METADATA: 'SurveyMetadata__c',
  SURVEY_SECTION: 'SurveySection__c',
  SURVEY_QUESTION: 'SurveyQuestion__c',
  CONTACT: 'contact',
  CDW_JUNCTION: 'CDW_Client_Junction__c',
  SURVEY: 'Survey__c'
};

export const openDatabase = async () => {
  let databaseInstance;

  return SQLite.openDatabase({
    name: databaseName,
    location: 'default'
  })
    .then(db => {
      databaseInstance = db;
      console.log('[db] Database open!');
    })
    .then(() => {
      database = databaseInstance;
      return databaseInstance;
    });
};

export const closeDatabase = () => {
  if (database === undefined) {
    return Promise.reject('[db] Database was not open; unable to close.');
  }
  return database.close().then(status => {
    console.log('[db] Database closed.');
    database = undefined;
  });
};

export const saveRecords = async (table, records) => {
  if (records && records.length > 0) {
    const firstRecord = records[0];
    const fields = getDatabaseFields(firstRecord);

    //Check for table.
    await checkAndCreateTable(table, fields);

    //Prepare insert statement
    const sqlInsertStatement = prepareInsertStatement(table, records, fields);
    console.log('sqlInsertStatement', sqlInsertStatement);

    return await database.executeSql(sqlInsertStatement);
  }
};

export const updateRecord = async (table, record, LocalId) => {
  if (record) {
    const fields = getDatabaseFields(record);
    //Prepare update statement
    const sqlUpdateStatement = prepareUpdateStatement(table, record, fields, LocalId);
    console.log('sqlUpdateStatement', sqlUpdateStatement);

    return await database.executeSql(sqlUpdateStatement);
  }
};

export const saveRecordsWithFields = async (
  table,
  records,
  fieldsWithDataTypes
) => {
  //Check for table.
  await checkAndCreateTableWithDataTypes(table, fieldsWithDataTypes);

  if (records && records.length > 0) {
    //Prepare insert statement

    const fields = fieldsWithDataTypes.map(
      fieldWithDataType => fieldWithDataType.split('#')[0]
    );

    const sqlInsertStatement = prepareInsertStatement(table, records, fields);
    console.log('sqlInsertStatement', sqlInsertStatement);

    await database.executeSql(sqlInsertStatement);
  }
};

export const getRecords = async (table, whereQuery) => {
  const sqlStatement = `SELECT * FROM ${table} ${whereQuery || ''}`;
  return new Promise((resolve, reject) => {
    try {
      database.executeSql(
        sqlStatement,
        [],
        results => {
          if (results === undefined) {
            resolve([]);
          }
          const count = results.rows.length;
          const lists = [];
          for (let i = 0; i < count; i++) {
            const row = results.rows.item(i);
            lists.push(row);
          }
          resolve(lists);
        },
        error => {
          console.log('MESSAGE', error);
          //reject(error.message);
          resolve([]);
        }
      );
      // database
      //   .executeSql(sqlStatement)
      //   .then(([results]) => {})
      //   .error(message => {

      //   });
    } catch (error) {
      reject(error);
    }
  });
};

export const markRecordNonDirty = async (table, LocalId) => {
  const sqlStatement = `UPDATE ${table} SET IsLocallyCreated = 0 WHERE LocalId = ${LocalId}`;
  return await database.executeSql(sqlStatement);
};

export const clearTable = async table => {
  const sqlStatement = `DROP TABLE IF EXISTS ${table};`;
  await database.executeSql(sqlStatement);
};

export const clearDatabase = async () => {
  for (const [key, value] of Object.entries(DB_TABLE)) {
    await clearTable(value);
  }
};

const prepareInsertStatement = (table, records, fields) => {
  var valuesArray = [];
  records.forEach(record => {
    var values = [];
    fields.forEach(field => {
      values.push(`"${record[field]}"`);
    });
    valuesArray.push(`(${values.join(',')})`);
  });

  const keys = fields.join(',');
  return `INSERT INTO ${table} (${keys}) VALUES ${valuesArray.join(',')}`;
};

const prepareUpdateStatement = (table, record, fields, LocalId) => {
    var pairArray = [];
    fields.forEach(field => {
      //Leave as it is for lookup fields
      if(!SURVEY_LOOKUP_FIELDS.includes(field)) {
        pairArray.push(`${field}="${record[field]}"`);
      }
    });
    return `UPDATE ${table} SET ${pairArray.join(',')} WHERE LocalId = ${LocalId}`;
};

const getDatabaseFields = record => {
  var keys = [];
  for (const [key, value] of Object.entries(record)) {
    if (typeof value != 'object' || value == null) {
      keys.push(key);
    }
  }
  return keys;
};

const checkAndCreateTable = async (table, fields) => {
  let fieldsWithType = fields.map(field => `${field} TEXT`).join(',');
  fieldsWithType = `${fieldsWithType}, IsLocallyCreated INTEGER DEFAULT 0`;
  fieldsWithType = `${fieldsWithType}, LocalId INTEGER PRIMARY KEY AUTOINCREMENT`;
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS ${table}( ${fieldsWithType});`
  );
};

const checkAndCreateTableWithDataTypes = async (table, fieldsWithDataType) => {
  let fieldsWithType = fieldsWithDataType
    .map(field => `${field.split('#')[0]} ${field.split('#')[1]}`)
    .join(',');
  fieldsWithType = `${fieldsWithType}, IsLocallyCreated INTEGER DEFAULT 0`;
  fieldsWithType = `${fieldsWithType}, LocalId INTEGER PRIMARY KEY AUTOINCREMENT`;
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS ${table}( ${fieldsWithType});`
  );
};

const getDatabase = async () => {
  if (database) {
    return database;
  } else {
    return openDatabase();
  }
};
