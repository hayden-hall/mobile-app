export interface Survey {
  subtitle: string;
  showCaret: boolean;
}

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
