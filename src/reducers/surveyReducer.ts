export interface SurveyAction {
  type: SurveyActionType;
  field: {
    name: string;
    value: any;
  };
}

const SurveyActionType = {
  UPDATE: 'UPDATE',
} as const;
type SurveyActionType = typeof SurveyActionType[keyof typeof SurveyActionType];

export const surveyReducer = (state, action: SurveyAction) => {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, [action.field.name]: action.field.value };
    default:
      throw new Error('Invalid action type for SurveyReducer');
  }
};
