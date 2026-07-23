import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Resume Analyzer',
    description: 'Paste a resume and get a structured review with strengths and improvements.',
    path: '/resume-analyzer',
    icon: '✎'
  },
  {
    title: 'ATS Checker',
    description: 'Compare your resume to a role and see the keywords you are missing.',
    path: '/ats-checker',
    icon: '✓'
  },
  {
    title: 'Cover Letter',
    description: 'Generate a polished first draft tailored to the job you want.',
    path: '/cover-letter',
    icon: '✉'
  },
  {
    title: 'Job Tracker',
    description: 'Keep all your applications, statuses, and progress in one list.',
    path: '/job-tracker',
    icon: '⧉'
  }
];

function FeatureCards() {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <Link key={feature.path} to={feature.path} className="feature-card">
          <div className="feature-icon">{feature.icon}</div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default FeatureCards;
