import React from 'react';

const SurveyContext = React.createContext({
  survey: {},
  dispatchSurvey: undefined,
});

export default SurveyContext;
