import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
const jobsFilePath = path.join(__dirname, 'data', 'jobs.json');
const dbPath = path.join(__dirname, 'data', 'app.db');

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(dbPath);
let dbReady = initDb();

function initDb() {
  return new Promise((resolve, reject) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT,
        provider TEXT DEFAULT 'local',
        provider_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES auth_users(id)
      );
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function readJobs() {
  if (!fs.existsSync(jobsFilePath)) {
    fs.writeFileSync(jobsFilePath, '[]');
    return [];
  }

  const data = fs.readFileSync(jobsFilePath, 'utf8');
  return JSON.parse(data);
}

function writeJobs(jobs) {
  fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2));
}

let jobs = readJobs();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  db.get('SELECT * FROM auth_users WHERE id = ?', [token], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', async (req, res) => {
  await dbReady;
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get('SELECT * FROM auth_users WHERE email = ? AND provider = ?', [email, 'local'], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO auth_users (email, password, provider, provider_id) VALUES (?, ?, ?, ?)', [email, hashed, 'local', `local-${email}`], function (err) {
      if (err) {
        return res.status(400).json({ message: 'User already exists' });
      }

      res.status(201).json({ message: 'User registered', token: String(this.lastID) });
    });
  });
});

app.post('/api/login', async (req, res) => {
  await dbReady;
  const { email, password } = req.body;
  db.get('SELECT * FROM auth_users WHERE email = ? AND provider = ?', [email, 'local'], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Logged in', token: String(user.id) });
  });
});

app.post('/api/auth/google', async (req, res) => {
  await dbReady;
  const { email, providerId } = req.body;
  const resolvedProviderId = providerId || `google-${email || Date.now()}`;

  db.get('SELECT * FROM auth_users WHERE provider = ? AND provider_id = ?', ['google', resolvedProviderId], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Google authentication failed' });
    }

    if (existingUser) {
      return res.json({ message: 'Signed in with Google', token: String(existingUser.id) });
    }

    db.run('INSERT INTO auth_users (email, password, provider, provider_id) VALUES (?, ?, ?, ?)', [email || null, null, 'google', resolvedProviderId], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Google authentication failed' });
      }

      res.status(201).json({ message: 'Signed in with Google', token: String(this.lastID) });
    });
  });
});

app.post('/api/auth/facebook', async (req, res) => {
  await dbReady;
  const { email, providerId } = req.body;
  const resolvedProviderId = providerId || `facebook-${email || Date.now()}`;

  db.get('SELECT * FROM auth_users WHERE provider = ? AND provider_id = ?', ['facebook', resolvedProviderId], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Facebook authentication failed' });
    }

    if (existingUser) {
      return res.json({ message: 'Signed in with Facebook', token: String(existingUser.id) });
    }

    db.run('INSERT INTO auth_users (email, password, provider, provider_id) VALUES (?, ?, ?, ?)', [email || null, null, 'facebook', resolvedProviderId], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Facebook authentication failed' });
      }

      res.status(201).json({ message: 'Signed in with Facebook', token: String(this.lastID) });
    });
  });
});

app.get('/api/demo', (_req, res) => {
  res.json({
    message: 'AI Job Application Assistant backend is running.',
    features: [
      'Resume analyzer',
      'ATS score checker',
      'Cover letter generator',
      'Job tracker'
    ]
  });
});

app.post('/api/resume-analyzer', async (req, res) => {
  const { resume = '' } = req.body;
  const text = resume.trim();

  if (!text) {
    return res.json({
      summary: 'Please provide resume content to analyze.',
      strengths: [],
      improvements: ['Add your resume text to get a tailored analysis.']
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const { OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey });
      const completion = await client.responses.create({
        model: 'gpt-4o-mini',
        input: `Analyze this resume and provide: 1) a short summary, 2) three strengths, 3) three improvements. Resume:\n\n${text}`
      });

      const content = completion.output_text || '';
      return res.json({
        summary: content,
        strengths: ['AI-generated strengths available'],
        improvements: ['AI-generated improvements available']
      });
    }
  } catch (error) {
    console.warn('OpenAI unavailable, using fallback resume analysis:', error.message);
  }

  return res.json({
    summary: 'Your resume is structured well and includes relevant experience. Focus on clarifying achievements and tailoring keywords to each role.',
    strengths: ['Clear experience section', 'Good use of action-oriented language', 'Strong foundation for tailoring'],
    improvements: ['Add quantified achievements', 'Tailor keywords to the target role', 'Trim generic statements']
  });
});

app.post('/api/ats-checker', (req, res) => {
  const { resume = '', jobDescription = '' } = req.body;
  const resumeText = resume.toLowerCase();
  const jdText = jobDescription.toLowerCase();
  const keywords = jdText.split(/[^a-z0-9]+/).filter(Boolean);
  const missingKeywords = keywords.filter((keyword) => !resumeText.includes(keyword)).slice(0, 8);
  const score = Math.max(45, 100 - missingKeywords.length * 6);

  res.json({
    score: Math.min(score, 100),
    summary: missingKeywords.length === 0
      ? 'Your resume strongly matches the target role.'
      : 'Your resume is close, but it is missing some important keywords from the job description.',
    missingKeywords
  });
});

app.post('/api/cover-letter', async (req, res) => {
  const { role = 'role', company = 'company', experience = 'your experience' } = req.body;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const { OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey });
      const completion = await client.responses.create({
        model: 'gpt-4o-mini',
        input: `Write a short persuasive cover letter opening paragraph for a ${role} role at ${company}. The candidate's experience is: ${experience}`
      });

      return res.json({ letter: completion.output_text || '' });
    }
  } catch (error) {
    console.warn('OpenAI unavailable, using fallback cover letter:', error.message);
  }

  const letter = `Dear Hiring Team,\n\nI am excited to apply for the ${role} position at ${company}. With my background in ${experience}, I believe I can contribute meaningfully to your team and help drive strong results. I would welcome the opportunity to discuss how my experience aligns with your goals.\n\nBest regards,\nYour Name`;

  return res.json({ letter });
});

app.get('/api/jobs', (_req, res) => {
  jobs = readJobs();
  res.json({ jobs });
});

app.post('/api/jobs', (req, res) => {
  const { company = '', role = '', status = 'Applied' } = req.body;
  const job = {
    id: Date.now().toString(),
    company,
    role,
    status
  };

  jobs = readJobs();
  jobs.push(job);
  writeJobs(jobs);
  res.status(201).json({ job });
});

app.get('/api/dashboard', (_req, res) => {
  jobs = readJobs();
  const stats = {
    totalApplications: jobs.length,
    applied: jobs.filter((job) => job.status === 'Applied').length,
    interviewing: jobs.filter((job) => job.status === 'Interviewing').length,
    offers: jobs.filter((job) => job.status === 'Offer').length
  };

  res.json({
    stats,
    recentJobs: jobs.slice(-5).reverse()
  });
});

dbReady
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
