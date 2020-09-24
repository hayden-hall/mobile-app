interface SurveyListAction {
  type: SurveyListActionType;
  surveys?: any;
}

const SurveyListActionType = {
  INITALIZE: 'INITIALIZE',
  REFRESH: 'REFRESH',
  ADD_SURVEY: 'ADD_SURVEY',
  DELETE_SURVEY: 'DELETE_SURVEY',
  SYNC_SURVEY: 'SYNC_SURVEY',
} as const;
type SurveyListActionType = typeof SurveyListActionType[keyof typeof SurveyListActionType];

export const surveyListReducer = (state, action: SurveyListAction) => {
  switch (action.type) {
    case 'INITIALIZE':
      return action.surveys;
    case 'ADD_SURVEY':
      return state;
    case 'DELETE_SURVEY':
      return state;
    default:
      throw new Error('Invalid action type for SurveyListReducer');
  }
};
