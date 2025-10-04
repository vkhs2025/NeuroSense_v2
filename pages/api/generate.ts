import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { extractFromBuffer } from '../../utils/extractDocx';
import { mapPlaceholders } from '../../utils/mapPlaceholders';
import { fillTemplate } from '../../utils/fillTemplate';
import type { TemplateType } from '../../types/placeholders';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = formidable({ multiples: false });
  const { fields, files }: any = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const file = files.file;
  const template: TemplateType = (fields.template as string) as TemplateType;
  const notes: string = (fields.notes as string) || '';

  if (!file) return res.status(400).send('File is required');
  if (!template) return res.status(400).send('Template selection is required');

  const filepath = Array.isArray(file) ? file[0].filepath : file.filepath;
  const originalFilename = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;
  const buffer = fs.readFileSync(filepath);
  const { paragraphs, meta } = await extractFromBuffer(buffer, originalFilename || 'input');

  console.log('[NeuroSense_v2] Extracted paragraphs:', meta.paragraphCount, 'Type:', meta.type);
  const placeholderMap = mapPlaceholders(template, paragraphs, { clinicianNotes: notes });
  console.log('[NeuroSense_v2] Mapped placeholders keys:', Object.keys(placeholderMap).length);

  const templateShort = template.startsWith('ADHD') ? 'ADHD' : 'Autism';
  let out: Buffer;
  try {
    out = fillTemplate(templateShort as 'ADHD' | 'Autism', placeholderMap);
  } catch (e: any) {
    console.error('[NeuroSense_v2] Error filling template:', e?.message);
    return res.status(500).send(e?.message || 'Template fill error');
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${templateShort}_Report.docx"`);
  res.setHeader('x-paragraph-count', String(meta.paragraphCount));
  res.status(200).send(out);
}
