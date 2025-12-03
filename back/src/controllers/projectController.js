const github = require('../services/github');
const storage = require('../services/storage');
const config = require('../config');

async function list(req, res) {
  const user = req.query.user || config.githubUsername;
  const force = req.query.refresh === '1' || req.query.force === '1';
  const visibleOnly = req.query.visible === '1' || req.query.visible === 'true';
  if (!user) return res.status(400).json({ ok: false, error: 'GitHub username not provided (query ?user= or GITHUB_USERNAME env)' });

  try {
    // fetch GitHub repos (cached when possible)
    let repos = [];
    if (!force) {
      const cached = await storage.getProjects(user);
      if (cached && cached.length > 0) {
        repos = cached;
      }
    }

    if (repos.length === 0) {
      const fetched = await github.fetchRepos(user);
      repos = fetched.filter(r => !r.fork);
      await storage.saveProjects(user, repos);
    }

    // map github projects
    const ghProjects = (repos || []).map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      html_url: r.html_url,
      _source: 'github'
    }));

    // load manual projects
    const manual = await storage.getManualProjects();
    const manualProjects = (manual || []).map(p => ({
      id: p.id,
      name: p.title, // map title to name for consistency with GitHub projects
      title: p.title,
      description: p.description,
      url: p.url || null,
      _source: 'manual',
      _raw: p
    }));

    const all = [...manualProjects, ...ghProjects];

    // resolve visibility for each project (default: visible)
    const result = [];
    for (const p of all) {
      const key = p._source === 'github' ? `github:${p.full_name}` : `manual:${p.id}`;
      const vis = await storage.getProjectVisibility(key);
      const visible = vis === null ? true : !!vis; // default visible when not set
      if (visibleOnly && !visible) continue;
      result.push({ ...p, visible });
    }

    res.json({ ok: true, source: 'combined', projects: result });
  } catch (err) {
    console.error('projectController.list error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { list };
