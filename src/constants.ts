import { ImageStyle, ViewStyle } from 'react-native';

export const APP_FONTS = {
  FONT_REGULAR: 'SalesforceSans-Regular',
  FONT_BOLD: 'SalesforceSans-Bold',
  FONT_LIGHT: 'SalesforceSans-Light',
};

export const APP_THEME = {
  APP_BASE_COLOR: '#01579b',
  NAVIGATION_BACKGROUND: '#f8f8f8',
  APP_BASE_FONT_COLOR: '#01579b',
  APP_DARK_FONT_COLOR: '#2b2826',
  APP_LIGHT_FONT_COLOR: '#706e6b',
  APP_BORDER_COLOR: '#dedcdb',
  APP_ERROR_COLOR: '#94221c',
  APP_LIST_HEADER_COLOR: '#e1f5fe',
  APP_WHITE: 'white',
};

export const ASYNC_STORAGE_KEYS = {
  SALESFORCE_ACCESS_TOKEN: '@SalesforceAccessToken',
  SALESFORCE_INSTANCE_URL: '@SalesforceInstanceURL',
  CDW_WORKED_ID: '@CdwWorkedId',
  CDW_WORKED_NAME: '@CdwWorkedName',
  AREA_CODE: '@AreaCode',
  NETWORK_CONNECTIVITY: '@NetworkConnectivity',
  LANGUAGE: '@Language',
};

export const BACKGROUND_IMAGE_SOURCE = require('../assets/images/background3x.png');

// Style for background container
export const BACKGROUND_STYLE: ViewStyle = {
  flex: 1,
  width: '100%',
  height: '100%',
  backgroundColor: '#FFF',
};

// Style for background image itself
export const BACKGROUND_IMAGE_STYLE: ImageStyle = {
  resizeMode: 'contain',
  alignSelf: 'flex-end',
  position: 'absolute',
  top: '25%', // TODO: Put bottom
};

export const DB_TABLE = {
  RecordType: 'RecordType',
  PageLayoutSection: 'PageLayoutSection',
  PageLayoutItem: 'PageLayoutItem',
  Survey: 'Survey',
};
