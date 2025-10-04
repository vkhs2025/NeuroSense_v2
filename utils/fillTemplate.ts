import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { PlaceholderMap } from '../types/placeholders';

export function fillTemplate(templateName: 'ADHD' | 'Autism', data: PlaceholderMap): Buffer {
  const filename = templateName === 'ADHD' ? 'ADHD.docx' : 'Autism.docx';
  const templatePath = path.join(process.cwd(), 'templates', filename);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}. Please add templates/${filename}`);
  }

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => ''
  });

  doc.setData(data);
  try {
    doc.render();
  } catch (error: any) {
    console.error('[NeuroSense_v2] Docxtemplater render error:', error);
    throw error;
  }

  const out = doc.getZip().generate({ type: 'nodebuffer' });
  return out;
}
