const path = require('path');
const fs = require('fs/promises');
const { execSync } = require('child_process');

// Deployment configuration
const BUILD_COMMAND = 'npm run build';
const GIT_BRANCH = 'main';
const REMOTE_NAME = 'origin';
const SOURCE_COMMIT_MESSAGE_PREFIX = 'Deploy build';

const rootDir = path.resolve(__dirname, '..');

function run(command, cwd = rootDir) {
  console.log(`Running: \"${command}\" in ${cwd}`);
  return execSync(command, { stdio: 'inherit', cwd });
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function removeDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

async function copyDocs(source, destination) {
  const preserveGit = path.resolve(destination) === path.resolve(targetRepoPath);

  if (preserveGit) {
    const entries = await fs.readdir(destination, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git') {
        continue;
      }
      await fs.rm(path.join(destination, entry.name), { recursive: true, force: true });
    }
  } else {
    await fs.rm(destination, { recursive: true, force: true });
    await fs.mkdir(destination, { recursive: true });
  }

  await fs.cp(source, destination, { recursive: true });
}

async function deploy() {
  console.log('Starting test deployment...');

  // Prepare commit message timestamp used for source and target repos
  const dateTime = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC');
  const sourceCommitMessage = `${SOURCE_COMMIT_MESSAGE_PREFIX} ${dateTime}`;

   // 1. Build the project in the current path
    run(BUILD_COMMAND, rootDir);

  try {
    // 0. Commit and push current repository (if there are any changes)
    console.log('Committing and pushing changes in current repository (if any)...');
    run('git add -A', rootDir);
    try {
      run(`git commit -m "${sourceCommitMessage}"`, rootDir);
    } catch (err) {
      console.log('No changes to commit in source repository.');
    }
    run(`git push ${REMOTE_NAME} ${GIT_BRANCH}`, rootDir);

  } finally {
    console.log('Deployment process completed.');
  }
}

deploy().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
