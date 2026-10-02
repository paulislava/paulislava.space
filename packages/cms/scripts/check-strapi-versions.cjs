// Reject incompatible Strapi admin packages before creating the production bundle.
const { spawnSync } = require('node:child_process');
const names = ['@strapi/admin','@strapi/content-manager','@strapi/strapi','@strapi/plugin-graphql'];
const result = spawnSync('npm', ['ls', ...names, '--all', '--json'], {encoding:'utf8', maxBuffer:16*1024*1024});
if (!result.stdout) throw new Error('Unable to inspect the Strapi dependency tree');
const found = new Set();
function visit(node) {
  for (const [name, dependency] of Object.entries(node.dependencies || {})) {
    if (names.includes(name) && dependency.version) found.add(dependency.version);
    visit(dependency);
  }
}
visit(JSON.parse(result.stdout));
if (found.size !== 1) throw new Error('Incompatible Strapi/admin versions: ' + [...found].join(', '));
console.log('Strapi/admin packages use one version: ' + [...found][0]);
