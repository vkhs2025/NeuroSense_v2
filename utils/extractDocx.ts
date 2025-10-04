import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export type ExtractResult = {
  text: string;
  paragraphs: string[];
  meta: { type: string; paragraphCount: number };
};

export async function extractFromBuffer(buffer: Buffer, filename: string): Promise<ExtractResult> {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
    return { text, paragraphs, meta: { type: 'docx', paragraphCount: paragraphs.length } };
  } else if (lower.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    const paragraphs = text.split(/\n{2,}|\r\n{2,}/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
    return { text, paragraphs, meta: { type: 'pdf', paragraphCount: paragraphs.length } };
  } else if (lower.endsWith('.txt')) {
    const text = buffer.toString('utf8').trim();
    const paragraphs = text.split(/\n{2,}|\r\n{2,}/).map(p => p.trim()).filter(Boolean);
    return { text, paragraphs, meta: { type: 'txt', paragraphCount: paragraphs.length } };
  } else {
    // attempt best-effort as text
    const text = buffer.toString('utf8').trim();
    const paragraphs = text.split(/\n{2,}|\r\n{2,}/).map(p => p.trim()).filter(Boolean);
    return { text, paragraphs, meta: { type: 'unknown', paragraphCount: paragraphs.length } };
  }
}
