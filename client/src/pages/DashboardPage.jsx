import { useEffect, useState } from 'react';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/dashboard');
      const payload = await response.json();
      setData(payload);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div className="page"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-intro">Monitor your application pipeline and recent activity.</p>

      <div className="dashboard-grid">
        <div className="panel stat-card">
          <h2>Total Applications</h2>
          <p>{data.stats.totalApplications}</p>
        </div>
        <div className="panel stat-card">
          <h2>Applied</h2>
          <p>{data.stats.applied}</p>
        </div>
        <div className="panel stat-card">
          <h2>Interviewing</h2>
          <p>{data.stats.interviewing}</p>
        </div>
        <div className="panel stat-card">
          <h2>Offers</h2>
          <p>{data.stats.offers}</p>
        </div>
      </div>

      <div className="panel">
        <h2>Recent Applications</h2>
        {data.recentJobs.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <ul className="job-list">
            {data.recentJobs.map((job) => (
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

export default DashboardPage;
