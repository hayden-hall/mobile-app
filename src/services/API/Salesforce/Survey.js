import { getDataFromQuery, createNewObject } from './SalesforceAPI';
import {
  saveRecords,
  updateRecord,
  DB_TABLE,
  clearTable,
  getRecords,
  saveRecordsWithFields,
  markRecordNonDirty
} from '../../Database';
import { prepareIdsForSqllite } from '../../../utility';
import { getAllOfflineContacts } from './Contact';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { labels } from '../../../stringConstants';
import AsyncStorage from '@react-native-community/async-storage';
import { checkForDatabaseNull } from '../../../utility';

export const MotherChildPickerType__c = {
  NONE: '',
  MOTHER: 'Mother',
  MOTHER_CHILD: 'Mother-Child',
  ANTE_NATAL: 'Ante-Natal',
  BENEFICIARY: 'Beneficiary'
};

const getAllSurveysFromSalesforce = async (areaCode, fieldsWithDataType) => {
  const fields = fieldsWithDataType.map(
    fieldWithDataType => fieldWithDataType.split('#')[0]
  );
  const fieldsString = fields.join(',');
  const query = `SELECT ${fieldsString} FROM Survey__c WHERE Area_Code__c = '${areaCode}'`;
  const response = await getDataFromQuery(query);
  if (response.records) {
    await clearTable(DB_TABLE.SURVEY);
    await saveRecordsWithFields(
      DB_TABLE.SURVEY,
      response.records,
      fieldsWithDataType
    );
    return response;
  } else {
    if (response.length > 0) {
      return Promise.reject(response[0].message);
    }
  }
};

const getAllSurveyMetadataFromSalesforce = async () => {
  const query = `SELECT Id,isMotherChild__c,Name,SurveyRecordTypeId__c,MotherChildPickerType__c,Survey_Name_Nepali__c FROM SurveyMetadata__c`;
  const response = await getDataFromQuery(query);
  await clearTable(DB_TABLE.SURVEY_METADATA);
  await saveRecords(DB_TABLE.SURVEY_METADATA, response.records);
  return response;
};

const getAllSurveySectionsFromSalesforce = async () => {
  const query = `SELECT Id,Name,Order__c,SurveyMetadata__c,Section_Name_Nepali__c FROM SurveySection__c`;
  const response = await getDataFromQuery(query);
  await clearTable(DB_TABLE.SURVEY_SECTION);
  await saveRecords(DB_TABLE.SURVEY_SECTION, response.records);
  return response;
};

const getAllSurveyQuestionsFromSalesforce = async () => {
  const query = `SELECT APIName__c,Id,IsMandatory__c,Name,OptionsValue__c,Order__c,QuestionText__c,Question_Name_Nepali__c,QuestionType__c,SurveySection__c FROM SurveyQuestion__c`;
  const response = await getDataFromQuery(query);
  await clearTable(DB_TABLE.SURVEY_QUESTION);
  await saveRecords(DB_TABLE.SURVEY_QUESTION, response.records);
  return response;
};

export const getAllSurveys = async () => {
  let records = await getRecords(DB_TABLE.SURVEY, '');
  const contacts = await getAllOfflineContacts();
  const surveyMetadata = await getOfflineStoredSurveyMetadata();

  records = records.map(record => {
    let result = { ...record };

    //Find the survey Type.
    const survey = surveyMetadata.filter(
      object => `${object.SurveyRecordTypeId__c}` == `${record.RecordTypeId}`
    );
    if (survey && survey.length > 0) {
      result = { ...result, Survey_Type: survey[0].Name };
    }

    let motherChild = [];
    //Find the contacts for mother and child.
    const mother = contacts.filter(contact => contact.Id == record.Mother__c);
    if (mother && mother.length > 0) {
      motherChild.push(`${mother[0].FirstName} ${mother[0].LastName}`);
    } else if (
      checkForDatabaseNull(record.Mother_First_Name__c) &&
      checkForDatabaseNull(record.Mother_Last_Name__c)
    ) {
      motherChild.push(
        `${record.Mother_First_Name__c} ${record.Mother_Last_Name__c}`
      );
    }
    const child = contacts.filter(contact => contact.Id == record.Child__c);
    if (child && child.length > 0) {
      motherChild.push(`${child[0].FirstName} ${child[0].LastName}`);
    } else if (
      checkForDatabaseNull(record.Child_First_Name__c) &&
      checkForDatabaseNull(record.Child_Last_Name__c)
    ) {
      motherChild.push(
        `${record.Child_First_Name__c} ${record.Child_Last_Name__c}`
      );
    }

    const beneficiary = contacts.filter(
      contact => contact.Id == record.Beneficiary_Name__c
    );
    if (beneficiary && beneficiary.length > 0) {
      motherChild.push(
        `${beneficiary[0].FirstName} ${beneficiary[0].LastName}`
      );
    }

    result = {
      ...result,
      Survey_Heading:
        motherChild && motherChild.length > 0
          ? motherChild.join(' • ')
          : record.Name
    };

    return result;
  });

  //Sort the surveys to show the latest on top.
  records.sort((survey1, survey2) => {
    return (
      new Date(survey2.Visit_Clinic_Date__c) -
      new Date(survey1.Visit_Clinic_Date__c)
    );
  });

  return records;
};

export const getOfflineStoredSurveyMetadata = async () => {
  let records = await getRecords(DB_TABLE.SURVEY_METADATA, '');

  const selectedLanguage = await AsyncStorage.getItem(
    ASYNC_STORAGE_KEYS.LANGUAGE
  );
  if (selectedLanguage && selectedLanguage === 'ne') {
    records = records.map(record => {
      let { Name, Survey_Name_Nepali__c } = record;
      if (checkForDatabaseNull(Survey_Name_Nepali__c)) {
        Name = Survey_Name_Nepali__c;
      }
      return { ...record, Name };
    });
  }

  return records;
};

export const getOfflineSurveyQuestionsForSurveyMetadata = async surveyMetadataId => {
  let sections = await getRecords(
    DB_TABLE.SURVEY_SECTION,
    `WHERE SurveyMetadata__c = "${surveyMetadataId}"`
  );

  sections.sort((obj1, obj2) => {
    if (parseInt(obj1.Order__c) > parseInt(obj2.Order__c)) {
      return 1;
    } else if (parseInt(obj1.Order__c) < parseInt(obj2.Order__c)) {
      return -1;
    }
    return 0;
  });

  const sectionsIdsForSql = prepareIdsForSqllite(
    sections.map(section => section.Id)
  );

  const questions = await getRecords(
    DB_TABLE.SURVEY_QUESTION,
    `WHERE SurveySection__c IN (${sectionsIdsForSql})`
  );

  sections = sections.map(section => {
    let sectionQuestions = questions.filter(
      question => question.SurveySection__c === section.Id
    );

    sectionQuestions.sort((obj1, obj2) => {
      if (parseInt(obj1.Order__c) > parseInt(obj2.Order__c)) {
        return 1;
      } else if (parseInt(obj1.Order__c) < parseInt(obj2.Order__c)) {
        return -1;
      }
      return 0;
    });

    return { ...section, data: sectionQuestions };
  });

  return sections;
};

export const getOfflineCreatedSurvey = async survey => {
  const surveyMetadatas = await getRecords(
    DB_TABLE.SURVEY_METADATA,
    `WHERE SurveyRecordTypeId__c = "${survey.RecordTypeId}"`
  );

  const contacts = await getRecords(
    DB_TABLE.CONTACT,
    `WHERE Id IN ("${survey.Mother__c}","${survey.Child__c}","${survey.Beneficiary_Name__c}")`
  );

  if (surveyMetadatas && surveyMetadatas.length > 0) {
    const surveyMetadata = surveyMetadatas[0];

    let sections = await getRecords(
      DB_TABLE.SURVEY_SECTION,
      `WHERE SurveyMetadata__c = "${surveyMetadata.Id}"`
    );

    sections.sort((obj1, obj2) => {
      if (parseInt(obj1.Order__c) > parseInt(obj2.Order__c)) {
        return 1;
      } else if (parseInt(obj1.Order__c) < parseInt(obj2.Order__c)) {
        return -1;
      }
      return 0;
    });

    const sectionsIdsForSql = prepareIdsForSqllite(
      sections.map(section => section.Id)
    );

    const questions = await getRecords(
      DB_TABLE.SURVEY_QUESTION,
      `WHERE SurveySection__c IN (${sectionsIdsForSql})`
    );

    sections = sections.map(section => {
      let sectionQuestions = questions.filter(
        question => question.SurveySection__c === section.Id
      );

      //map to survey Answers.
      sectionQuestions = sectionQuestions.map(question => {
        if (
          survey.hasOwnProperty(question.APIName__c) &&
          survey[question.APIName__c] != 'null' &&
          survey[question.APIName__c] != null
        ) {
          let Answer__c = `${survey[question.APIName__c]}`;

          //Check for boolean values
          if (Answer__c === 'true') {
            Answer__c = true;
          } else if (Answer__c === 'false') {
            Answer__c = false;
          }

          //A function to populate contact detail to answer
          getContactDetailForContact = contactId => {
            const filteredContacts = contacts.filter(
              contact => contact.Id == contactId
            );
            if (filteredContacts && filteredContacts.length > 0) {
              return `${filteredContacts[0].FirstName} ${filteredContacts[0].LastName}`;
            }
          };

          //Populate Mother
          if (question.APIName__c === 'Mother__c' && survey.Mother__c) {
            return {
              ...question,
              Answer__c: getContactDetailForContact(survey.Mother__c),
              disabled: true
            };
          } else if (question.APIName__c === 'Child__c' && survey.Child__c) {
            return {
              ...question,
              Answer__c: getContactDetailForContact(survey.Child__c),
              disabled: true
            };
          } else if (
            question.APIName__c === 'Beneficiary_Name__c' &&
            survey.Beneficiary_Name__c
          ) {
            return {
              ...question,
              Answer__c: getContactDetailForContact(survey.Beneficiary_Name__c),
              disabled: true
            };
          }

          return { ...question, Answer__c, disabled: true };
        } else {
          return { ...question, disabled: true };
        }
      });

      sectionQuestions.sort((obj1, obj2) => {
        if (parseInt(obj1.Order__c) > parseInt(obj2.Order__c)) {
          return 1;
        } else if (parseInt(obj1.Order__c) < parseInt(obj2.Order__c)) {
          return -1;
        }
        return 0;
      });

      return { ...section, data: sectionQuestions };
    });

    return sections;
  }
};

export const getOfflineSurveys = async () => {
  return await getRecords(DB_TABLE.SURVEY, 'WHERE IsLocallyCreated = 1');
};

export const createNewSurvey = async survey => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  //TODO: Check for network connectivity, if connected then upload the survey to Saleforce and then save to database.
  //If no network is detected then save the record to local database.
  const connectivity = await AsyncStorage.getItem(
    ASYNC_STORAGE_KEYS.NETWORK_CONNECTIVITY
  );
  if (connectivity == true) {
    return await saveRecords(DB_TABLE.SURVEY, [payload]);
  } else {
    return await saveRecords(DB_TABLE.SURVEY, [payload]);
  }
};

export const updateSurvey = async (survey, LocalId) => {
  const payload = { ...survey, IsLocallyCreated: 1 };
  //TODO: Check for network connectivity, if connected then upload the survey to Saleforce and then save to database.
  //If no network is detected then save the record to local database.
  const connectivity = await AsyncStorage.getItem(
    ASYNC_STORAGE_KEYS.NETWORK_CONNECTIVITY
  );
  if (connectivity == true) {
    return await updateRecord(DB_TABLE.SURVEY, payload, LocalId);
  } else {
    return await updateRecord(DB_TABLE.SURVEY, payload, LocalId);
  }
}

export const uploadSurveyToSalesforce = async survey => {
  let payload = {};
  for (const [key, value] of Object.entries(survey)) {
    if (value != null && key != 'IsLocallyCreated' && key != 'LocalId') {
      payload = { ...payload, [key]: value };
    }
  }
  return new Promise(async (resolve, reject) => {
    const response = await createNewObject(DB_TABLE.SURVEY, payload);
    if (response && response.id) {
      try {
        await markRecordNonDirty(DB_TABLE.SURVEY, survey.LocalId);
      } catch (error) {
        reject(error.message);
      }
      resolve(response.id);
    } else if (response && response.length > 0 && response[0].errorCode) {
      reject(response[0].message);
    } else {
      reject(labels.SALESFORCE_OBJECT_CREATION_ERROR);
    }
  });
};

export {
  getAllSurveysFromSalesforce,
  getAllSurveyMetadataFromSalesforce,
  getAllSurveySectionsFromSalesforce,
  getAllSurveyQuestionsFromSalesforce
};
