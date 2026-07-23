import { useState } from 'react';

function CoverLetterPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, company, experience })
    });
    const data = await response.json();
    setLetter(data.letter);
    setLoading(false);
  };

  return (
    <div className="page">
      <h1>Cover Letter Generator</h1>
      <p className="page-intro">Create a tailored opening paragraph for the role you're targeting.</p>
      <form onSubmit={submit} className="panel">
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Describe your relevant experience..."
          rows={8}
        />
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Cover Letter'}</button>
      </form>

      {letter && (
        <div className="result panel">
          <h2>Draft Letter</h2>
          <p>{letter}</p>
        </div>
      )}
    </div>
  );
}

export default CoverLetterPage;
