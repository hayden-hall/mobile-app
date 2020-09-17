interface SurveyAction {
  type: SurveyActionType;
  surveys?: any;
}

const SurveyActionType = {
  INITALIZE: 'INITIALIZE',
  REFRESH: 'REFRESH',
  ADD_SURVEY: 'ADD_SURVEY',
  DELETE_SURVEY: 'DELETE_SURVEY',
  SYNC_SURVEY: 'SYNC_SURVEY',
} as const;
type SurveyActionType = typeof SurveyActionType[keyof typeof SurveyActionType];

export const surveyReducer = (state, action: SurveyAction) => {
  switch (action.type) {
    case 'INITIALIZE':
      return action.surveys;
    case 'ADD_SURVEY':
      return state;
    case 'DELETE_SURVEY':
      return state;
    default:
      throw new Error('Invalid action type for SurveyReducer');
  }
};
