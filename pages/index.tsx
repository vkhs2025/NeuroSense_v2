import React, { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { useDropzone } from 'react-dropzone';
import PulsatingCircle from '../components/PulsatingCircle';

export default function Home() {
  const [template, setTemplate] = useState<'ADHD Assessment (CYP)' | 'Autism Assessment (CYP)'>('ADHD Assessment (CYP)');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted && accepted.length > 0) {
      setFile(accepted[0]);
      setMessage(`${accepted[0].name} selected`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    }
  });

  const canGenerate = useMemo(() => !!file && !!template, [file, template]);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setParsedCount(null);
    setMessage('Uploading & generating...');

    const form = new FormData();
    form.append('file', file);
    form.append('template', template);
    form.append('notes', notes);

    const res = await fetch('/api/generate', { method: 'POST', body: form });
    if (!res.ok) {
      const text = await res.text();
      setMessage(`Error: ${text}`);
      setLoading(false);
      return;
    }

    const paragraphHeader = res.headers.get('x-paragraph-count');
    if (paragraphHeader) setParsedCount(parseInt(paragraphHeader, 10));

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const outName = template.startsWith('ADHD') ? 'ADHD_Report.docx' : 'ASD_Report.docx';
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    setMessage('✅ Report generated and downloaded.');
    setLoading(false);
  };

  return (
    <div className="bg-app">
      <Head>
        <title>NeuroSense_v2</title>
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center">
          <PulsatingCircle />

          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">NeuroSense_v2</h1>
          <p className="text-white/90 mt-2 text-center">Generate clinical reports by mapping extracted text to your templates.</p>

          <div className="card w-full mt-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-white/90">Report Type</label>
                <select
                  className="select"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as any)}
                >
                  <option>ADHD Assessment (CYP)</option>
                  <option>Autism Assessment (CYP)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-white/90">Clinician Notes (optional)</label>
                <input
                  className="input"
                  placeholder="Add quick notes to include in report..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div
              {...getRootProps()}
              className={`mt-5 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition ${
                isDragActive ? 'border-white bg-white/10' : 'border-white/40 bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-white/90 text-center">
                {isDragActive ? 'Drop the file here...' : 'Drag & drop a .docx/.pdf/.txt file here, or click to select'}
              </p>
              <p className="text-white/70 text-center text-sm mt-1">
                {file ? `Selected: ${file.name}` : 'No file selected yet'}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                className="button"
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
              >
                {loading ? 'Generating...' : 'Generate & Download .docx'}
              </button>
              {parsedCount !== null && (
                <span className="text-white/90 text-sm">Parsed paragraphs: {parsedCount}</span>
              )}
            </div>

            <div className="mt-3 text-white/80 text-sm">{message}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
