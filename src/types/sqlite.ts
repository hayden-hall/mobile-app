export interface RecordType {
  name: string;
  label: string;
  recordTypeId: string;
  layoutId: string;
}

export interface FieldTypeMapping {
  name: string;
  type: 'text' | 'integer' | 'blob'; // NOTICE: sqlite cannot have boolean type
}

export interface PageLayoutItem {
  pageLayoutId: string;
  pageLayoutLabel: string;
  sectionLabel: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
}
