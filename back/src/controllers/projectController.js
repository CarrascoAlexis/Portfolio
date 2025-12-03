const github = require('../services/github');
const storage = require('../services/storage');
const config = require('../config');

async function list(req, res) {
  const user = req.query.user || config.githubUsername;
  const force = req.query.refresh === '1' || req.query.force === '1';
  const visibleOnly = req.query.visible === '1' || req.query.visible === 'true';
  if (!user) {
    console.warn('projectController.list: no GitHub username configured, skipping GitHub repos');
  }

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
      description: r.description || null,
      language: r.language,
      html_url: r.url || r.html_url,
      owner: r.full_name ? { login: r.full_name.split('/')[0] } : null,
      _source: 'github'
    }));

    // Merge custom metadata for GitHub projects (descriptions, technologies)
    for (const p of ghProjects) {
      const metadata = await storage.getGitHubProjectMetadata(p.full_name);
      if (metadata) {
        if (metadata.description) p.description = metadata.description;
        if (metadata.technologies) p.technologies = metadata.technologies;
        if (metadata.showReadme !== undefined) p.showReadme = metadata.showReadme;
      }
    }

    // load manual projects
    const manual = await storage.getManualProjects();
    const manualProjects = (manual || []).map(p => ({
      id: p.id,
      name: p.title, // map title to name for consistency with GitHub projects
      title: p.title,
      description: p.description || null,
      html_url: p.url || null,
      technologies: p.technologies || [],
      _source: 'manual',
      _raw: p
    }));

    const all = [...manualProjects, ...ghProjects];

    // resolve visibility and tags for each project (default: visible)
    const result = [];
    for (const p of all) {
      const key = p._source === 'github' ? `github:${p.full_name}` : `manual:${p.id}`;
      const vis = await storage.getProjectVisibility(key);
      const visible = vis === null ? true : !!vis; // default visible when not set
      if (visibleOnly && !visible) continue;

      // Get custom tags (or use project's own tags for manual projects)
      const customTags = await storage.getProjectTags(key);
      const tags = customTags || (p._raw?.tags) || [];

      result.push({ ...p, visible, tags });
    }

    res.json({ ok: true, source: 'combined', projects: result });
  } catch (err) {
    console.error('projectController.list error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function updateGitHubMetadata(req, res) {
  try {
    const { projectKey, description, technologies } = req.body;
    
    if (!projectKey) {
      return res.status(400).json({ ok: false, error: 'projectKey required' });
    }
    
    const metadata = {};
    if (description !== undefined) metadata.description = description;
    if (technologies !== undefined) metadata.technologies = technologies;
    
    await storage.setGitHubProjectMetadata(projectKey, metadata);
    
    res.json({ ok: true, message: 'Metadata updated' });
  } catch (err) {
    console.error('projectController.updateGitHubMetadata error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { list, updateGitHubMetadata };
