export interface DescribeLayouts {
  layouts: any;
  recordTypeMappings: Array<RecordTypeMapping>;
  recordTypeSelectorRequired: any;
}

export interface RecordTypeMapping {
  active: boolean;
  available: boolean;
  defaultRecordTypeMapping: boolean;
  developerName: string;
  layoutId: string;
  master: boolean;
  name: string;
  picklistsForRecordType: Array<any>;
  recordTypeId: string;
  url: {
    layout: string;
  };
}
