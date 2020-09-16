export interface DescribeLayoutResult {
  recordTypeMappings: Array<RecordTypeMapping>;
}

export interface RecordTypeMapping {
  active: boolean;
  available: boolean;
  defaultRecordTypeMapping: boolean;
  developerName: string;
  layoutId: string;
  master: boolean;
  name: string;
  recordTypeId: string;
  url: {
    layout: string;
  };
}

export interface DescribeLayout {
  editLayoutSections: Array<DescribeLayoutSection>;
}

export interface DescribeLayoutSection {
  useHeading: boolean;
  parentLayoutId: string;
  tabOrder: 'LeftToRight' | 'TopToBottom';
  layoutRows: Array<DescribeLayoutRow>;
}

export interface DescribeLayoutRow {
  layoutItems: Array<DescribeLayoutItem>;
}

export interface DescribeLayoutItem {
  layoutComponents: Array<DescribeLayoutComponent>; // Basically single component, but aggregation fields like address have multiple components
}

export interface DescribeLayoutComponent {
  details: DescribeFieldProperties;
}

export interface DescribeFieldProperties {
  label: string; // Field Label;
  name: string; // Field API Name
  type: string; // Data, Reference,
}
