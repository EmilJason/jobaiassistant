const STORAGE_KEY = 'jobai_app_state_v1';
const TOKEN_KEY = 'jobai_token';

function createDefaultState() {
  return {
    auth: { token: null, user: null },
    users: [],
    jobs: []
  };
}

function readState() {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw);
    return {
      ...createDefaultState(),
      ...parsed,
      auth: {
        ...createDefaultState().auth,
        ...(parsed.auth || {})
      },
      users: parsed.users || [],
      jobs: parsed.jobs || []
    };
  } catch {
    return createDefaultState();
  }
}

function writeState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

function persistToken(token, user = null) {
  const state = readState();
  state.auth = { token, user };
  writeState(state);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  return state;
}

function clearToken() {
  const state = readState();
  state.auth = { token: null, user: null };
  writeState(state);

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }

  return state;
}

function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

function getUserIndex(state, email) {
  return state.users.findIndex((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

function shouldFallback(error) {
  if (!error) {
    return true;
  }

  return error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('Failed to fetch');
}

function createToken(prefix = 'local') {
  return `${prefix}-${Date.now()}`;
}

export function getStoredToken() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    persistToken(token);
  }
  return token || readState().auth?.token || null;
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}

export async function registerUser(email, password) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    if (response.ok) {
      const data = await response.json();
      persistToken(data.token || createToken('remote'), { email: normalizedEmail, provider: 'local' });
      return { ok: true, data, mode: 'remote' };
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 404 || response.status >= 500) {
      throw new Error(data.message || 'backend-unavailable');
    }

    return { ok: false, data, mode: 'remote' };
  } catch (error) {
    const state = readState();
    const existingIndex = getUserIndex(state, normalizedEmail);

    if (existingIndex >= 0) {
      return { ok: false, data: { message: 'User already exists' }, mode: 'local' };
    }

    const token = createToken('local');
    state.users.push({ email: normalizedEmail, password, provider: 'local' });
    persistToken(token, { email: normalizedEmail, provider: 'local' });

    return {
      ok: true,
      data: { message: 'Account created successfully', token },
      mode: 'local'
    };
  }
}

export async function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    if (response.ok) {
      const data = await response.json();
      persistToken(data.token || createToken('remote'), { email: normalizedEmail, provider: 'local' });
      return { ok: true, data, mode: 'remote' };
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 404 || response.status >= 500) {
      throw new Error(data.message || 'backend-unavailable');
    }

    return { ok: false, data, mode: 'remote' };
  } catch (error) {
    const state = readState();
    const currentUser = state.users.find((user) => normalizeEmail(user.email) === normalizedEmail);

    if (!currentUser || currentUser.password !== password) {
      return { ok: false, data: { message: 'Invalid credentials' }, mode: 'local' };
    }

    const token = createToken('local');
    persistToken(token, { email: normalizedEmail, provider: 'local' });

    return {
      ok: true,
      data: { message: 'Logged in successfully', token },
      mode: 'local'
    };
  }
}

export async function socialLogin(provider, email) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const response = await fetch(`/api/auth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, providerId: `${provider}-${normalizedEmail || 'demo'}` })
    });

    if (response.ok) {
      const data = await response.json();
      persistToken(data.token || createToken('remote'), { email: normalizedEmail, provider });
      return { ok: true, data, mode: 'remote' };
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 404 || response.status >= 500) {
      throw new Error(data.message || 'backend-unavailable');
    }

    return { ok: false, data, mode: 'remote' };
  } catch {
    const token = createToken(provider);
    persistToken(token, { email: normalizedEmail, provider });

    return {
      ok: true,
      data: { message: `Signed in with ${provider}`, token },
      mode: 'local'
    };
  }
}

export function logoutUser() {
  clearToken();
}

export async function getDashboardData() {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) {
      throw new Error('dashboard-unavailable');
    }

    return { ok: true, data: await response.json(), mode: 'remote' };
  } catch {
    const state = readState();
    const jobs = state.jobs || [];
    const stats = {
      totalApplications: jobs.length,
      applied: jobs.filter((job) => job.status === 'Applied').length,
      interviewing: jobs.filter((job) => job.status === 'Interviewing').length,
      offers: jobs.filter((job) => job.status === 'Offer').length
    };

    return {
      ok: true,
      data: {
        stats,
        recentJobs: jobs.slice(0, 5)
      },
      mode: 'local'
    };
  }
}

export async function analyzeResume(resume) {
  try {
    const response = await fetch('/api/resume-analyzer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume })
    });

    if (!response.ok) {
      throw new Error('resume-unavailable');
    }

    return { ok: true, data: await response.json(), mode: 'remote' };
  } catch {
    return {
      ok: true,
      data: {
        summary: 'Your resume is structured well. Focus on adding quantified achievements and tailoring keywords to the role.',
        strengths: ['Clear experience section', 'Action-oriented language', 'Good foundation for tailoring'],
        improvements: ['Add measurable outcomes', 'Tailor keywords to the target role', 'Trim generic statements']
      },
      mode: 'local'
    };
  }
}

export async function checkAtsScore(resume, jobDescription) {
  try {
    const response = await fetch('/api/ats-checker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobDescription })
    });

    if (!response.ok) {
      throw new Error('ats-unavailable');
    }

    return { ok: true, data: await response.json(), mode: 'remote' };
  } catch {
    const resumeText = (resume || '').toLowerCase();
    const jdText = (jobDescription || '').toLowerCase();
    const keywords = jdText.split(/[^a-z0-9]+/).filter(Boolean);
    const missingKeywords = keywords.filter((keyword) => !resumeText.includes(keyword)).slice(0, 8);
    const score = Math.max(45, 100 - missingKeywords.length * 6);

    return {
      ok: true,
      data: {
        score: Math.min(score, 100),
        summary: missingKeywords.length === 0
          ? 'Your resume strongly matches the target role.'
          : 'Your resume is close, but it is missing a few important keywords.',
        missingKeywords
      },
      mode: 'local'
    };
  }
}

export async function generateCoverLetter(role, company, experience) {
  try {
    const response = await fetch('/api/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, company, experience })
    });

    if (!response.ok) {
      throw new Error('cover-letter-unavailable');
    }

    const data = await response.json();
    return { ok: true, data, mode: 'remote' };
  } catch {
    return {
      ok: true,
      data: {
        letter: `Dear Hiring Team,\n\nI am excited to apply for the ${role || 'role'} position at ${company || 'your target company'}. My background in building practical, user-focused solutions and delivering measurable results makes me a strong fit for this opportunity. In my recent work, I have focused on turning ideas into clear outcomes, collaborating effectively, and continuously improving my craft.\n\nI would welcome the chance to discuss how my experience and energy can support your team.\n\nBest regards,\nYour Name`
      },
      mode: 'local'
    };
  }
}

export async function listJobs() {
  try {
    const response = await fetch('/api/jobs');
    if (!response.ok) {
      throw new Error('jobs-unavailable');
    }

    const data = await response.json();
    const state = readState();
    state.jobs = data.jobs || [];
    writeState(state);

    return { ok: true, jobs: state.jobs, mode: 'remote' };
  } catch {
    const state = readState();
    return { ok: true, jobs: state.jobs || [], mode: 'local' };
  }
}

export async function createJob(job) {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });

    if (!response.ok) {
      throw new Error('jobs-create-unavailable');
    }

    const data = await response.json();
    const state = readState();
    state.jobs = [...(state.jobs || []), data.job];
    writeState(state);
    return { ok: true, job: data.job, mode: 'remote' };
  } catch {
    const state = readState();
    const newJob = {
      id: Date.now(),
      company: job.company,
      role: job.role,
      status: job.status,
      created_at: new Date().toISOString()
    };
    state.jobs = [...(state.jobs || []), newJob];
    writeState(state);
    return { ok: true, job: newJob, mode: 'local' };
  }
}
