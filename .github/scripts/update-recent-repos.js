const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const username = 'Sandeepkumar-S-18';
const maxRepos = 5;
const readmePath = 'README.md';
const theme = 'default_repocard'; // you can change theme if you like

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function run() {
  console.log(`Fetching latest ${maxRepos} repos for ${username}...`);

  const { data: repos } = await octokit.repos.listForUser({
    username,
    sort: 'updated',
    per_page: 100
  });

  const filtered = repos.filter(r => !r.fork).slice(0, maxRepos);

  const md = `
<p align="left">
  ${filtered.map(r => `
  <a href="${r.html_url}">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${r.name}&theme=${theme}" />
  </a>
  `).join('\n')}
</p>
`;

  const readme = fs.readFileSync(readmePath, 'utf8');
  const start = '<!--START_SECTION:recent_repos-->';
  const end = '<!--END_SECTION:recent_repos-->';
  const newContent = readme.replace(
    new RegExp(`${start}[\\s\\S]*${end}`),
    `${start}\n${md}\n${end}`
  );

  fs.writeFileSync(readmePath, newContent);
  console.log('✅ Updated README with recent repos.');
}

run().catch(err => {
  console.error('❌ Error updating recent repos:', err);
  process.exit(1);
});
