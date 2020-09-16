export interface RecordType {
  developerName: string;
  name: string;
  recordTypeId: string;
  layoutId: string;
}

export interface FieldTypeMapping {
  field: string;
  type: 'text' | 'integer' | 'blob'; // NOTICE: sqlite cannot have boolean type
}
