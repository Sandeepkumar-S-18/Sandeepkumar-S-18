const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const username = process.env.GITHUB_ACTOR || 'Sandeepkumar-S-18';
const maxRepos = 5;
const readmePath = 'README.md';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN // provided by Actions automatically
});

async function run() {
  const { data: repos } = await octokit.repos.listForUser({
    username,
    sort: 'updated',
    per_page: 100
  });

  const filtered = repos.filter(r => !r.fork).slice(0, maxRepos);

  // Build markdown — change this template however you like
  const md = filtered.map(r => {
    return `- [${r.name}](${r.html_url}) — ${r.description || 'No description'}  \n  ⭐ ${r.stargazers_count} • Updated ${new Date(r.updated_at).toLocaleDateString()}`;
  }).join('\n');

  const readme = fs.readFileSync(readmePath, 'utf8');
  const start = '<!--START_SECTION:recent_repos-->';
  const end = '<!--END_SECTION:recent_repos-->';
  const newReadme = readme.replace(new RegExp(`${start}[\\s\\S]*${end}`), `${start}\n${md}\n${end}`);
  fs.writeFileSync(readmePath, newReadme);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
