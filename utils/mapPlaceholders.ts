import { PlaceholderMap, TemplateType } from '../types/placeholders';

export function mapPlaceholders(
  template: TemplateType,
  paragraphs: string[],
  extras: { clinicianNotes?: string }
): PlaceholderMap {
  const map: PlaceholderMap = {};

  // Generic paragraph mapping
  paragraphs.forEach((p, idx) => {
    map[`PARAGRAPH_${idx + 1}`] = p;
  });

  // Optional clinician notes
  if (extras.clinicianNotes) {
    map.CLINICIAN_NOTES = extras.clinicianNotes;
  }

  // Template-specific defaults (can be extended later)
  if (template === 'ADHD Assessment (CYP)') {
    map.DIAGNOSIS = map.DIAGNOSIS || 'Attention Deficit Hyperactivity Disorder (ADHD)';
  } else if (template === 'Autism Assessment (CYP)') {
    map.DIAGNOSIS = map.DIAGNOSIS || 'Autism Spectrum Disorder (ASD)';
  }

  return map;
}
