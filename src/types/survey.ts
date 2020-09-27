export interface SurveyItem {
  subtitle: string;
  showCaret: boolean;
}

/**
 * Object for survey layout definition used in 'SectionList' component on survey editor screen.
 */
export interface SurveyLayout {
  sections?: Array<{
    id: string;
    title: string;
    data: Array<{
      name: string;
      label: string;
      type: string;
    }>;
  }>;
}
