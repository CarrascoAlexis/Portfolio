const github = require('../services/github');
const storage = require('../services/storage');

async function list(req, res) {
  const user = req.query.user || process.env.GITHUB_USERNAME;
  const force = req.query.refresh === '1' || req.query.force === '1';
  if (!user) return res.status(400).json({ ok: false, error: 'GitHub username not provided (query ?user= or GITHUB_USERNAME env)' });

  try {
    if (!force) {
      const cached = await storage.getProjects(user);
      if (cached && cached.length > 0) {
        return res.json({ ok: true, source: 'cache', projects: cached });
      }
    }

    const repos = await github.fetchRepos(user);
    // Optionally filter out forks or private repos
    const projects = repos.filter(r => !r.fork);
    await storage.saveProjects(user, projects);
    res.json({ ok: true, source: 'github', projects });
  } catch (err) {
    console.error('projectController.list error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { list };
