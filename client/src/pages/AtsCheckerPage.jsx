import { useState } from 'react';
import { checkAtsScore } from '../services/appClient';

function AtsCheckerPage() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await checkAtsScore(resume, jobDescription);
    setResult(response.data);
    setLoading(false);
  };

  return (
    <div className="page">
      <h1>ATS Score Checker</h1>
      <p className="page-intro">Paste your resume and a job description to score the match.</p>
      <form onSubmit={submit} className="panel">
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume..."
          rows={8}
        />
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description..."
          rows={8}
        />
        <button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check ATS Match'}</button>
      </form>

      {result && (
        <div className="result panel">
          <h2>ATS Score: {result.score}/100</h2>
          <p>{result.summary}</p>
          <h3>Missing Keywords</h3>
          <ul>{result.missingKeywords.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default AtsCheckerPage;
