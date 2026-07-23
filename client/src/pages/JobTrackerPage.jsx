import { useEffect, useState } from 'react';
import { createJob, listJobs } from '../services/appClient';

function JobTrackerPage() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied' });
  const [loading, setLoading] = useState(false);

  const loadJobs = async () => {
    const response = await listJobs();
    setJobs(response.jobs);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await createJob(form);
    setJobs((prev) => [...prev, response.job]);
    setForm({ company: '', role: '', status: 'Applied' });
    setLoading(false);
  };

  return (
    <div className="page">
      <h1>Job Tracker</h1>
      <p className="page-intro">Track applications and update their progress over time.</p>
      <form onSubmit={submit} className="panel">
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" />
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Application'}</button>
      </form>

      <div className="panel">
        <h2>Applications</h2>
        {jobs.length === 0 ? <p>No applications yet.</p> : (
          <ul className="job-list">
            {jobs.map((job) => (
              <li key={job.id}>
                <strong>{job.company}</strong> — {job.role} <span>({job.status})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default JobTrackerPage;
