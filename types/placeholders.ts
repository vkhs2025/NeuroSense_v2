export type TemplateType = 'ADHD Assessment (CYP)' | 'Autism Assessment (CYP)';

export interface PlaceholderMap {
  // universal
  PATIENT_NAME?: string;
  PATIENT_AGE?: string;
  PATIENT_GENDER?: string;
  SCHOOL_NAME?: string;
  YEAR_LEVEL?: string;
  ASSESSMENT_DATE?: string;
  ASSESSOR_NAME?: string;
  PARENT_NAME?: string;
  CONSULTATION_TYPE?: string;
  CONSENT_TYPE?: string;
  REFERRED_REASON?: string;
  DIAGNOSIS?: string;
  CLINICIAN_NOTES?: string;

  // dynamic paragraphs
  [key: `PARAGRAPH_${number}`]: string | undefined;
}
