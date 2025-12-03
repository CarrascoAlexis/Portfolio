const DEFAULT_GITHUB_API = 'https://api.github.com';

async function fetchRepos(username, opts = {}) {
  if (!username) throw new Error('GitHub username required');
  const token = process.env.GITHUB_TOKEN;
  const perPage = opts.per_page || 100;
  const url = `${DEFAULT_GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&sort=updated`;
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'portfolio-back' };
  if (token) headers.Authorization = `token ${token}`;

  // use node global fetch if available, otherwise try to require node-fetch
  const _fetch = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;

  const res = await _fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`GitHub API error: ${res.status} ${res.statusText} ${text}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  // Map to a simpler project shape
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    url: r.html_url,
    language: r.language,
    topics: r.topics || [],
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    updated_at: r.updated_at
  }));
}

module.exports = { fetchRepos };
