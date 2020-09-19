export interface Survey {
  subtitle: string;
  showCaret: boolean;
}

export interface SurveyLayout {
  sections?: Array<{
    id: string;
    label: string;
    items?: Array<{
      name: string;
      label: string;
      type: string;
    }>;
  }>;
}
