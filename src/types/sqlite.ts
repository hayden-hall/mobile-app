export interface RecordType {
  name: string; // Primary key
  label: string;
  recordTypeId: string;
  layoutId: string;
}

export interface FieldTypeMapping {
  name: string;
  type: 'text' | 'integer' | 'blob'; // NOTICE: sqlite cannot have boolean type
}

export interface PageLayoutSection {
  id: string; // Primary key
  layoutId: string;
  sectionLabel: string;
}

export interface PageLayoutItem {
  sectionId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
}

export interface Localization {
  type: string; // TODO: 'RecordType' | 'PageLayoutSection' | 'PageLayoutItem';
  locale: string; // TODO: 'en' | 'ne'
  name: string;
  label: string;
}
