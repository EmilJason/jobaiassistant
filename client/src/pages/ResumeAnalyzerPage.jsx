import { useState } from 'react';

function ResumeAnalyzerPage() {
  const [resume, setResume] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/resume-analyzer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume })
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="page">
      <h1>Resume Analyzer</h1>
      <p className="page-intro">Paste your resume text and receive a structured review.</p>
      <form onSubmit={submit} className="panel">
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume here..."
          rows={12}
        />
        <button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Resume'}</button>
      </form>

      {result && (
        <div className="result panel">
          <h2>Summary</h2>
          <p>{result.summary}</p>
          <h3>Strengths</h3>
          <ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Improvements</h3>
          <ul>{result.improvements.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzerPage;
