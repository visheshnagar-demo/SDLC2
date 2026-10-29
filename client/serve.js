const { spawn } = require('child_process');

const rawArgs = process.argv.slice(2);
let port = process.env.PORT || '4200';
let host = process.env.HOST || '127.0.0.1';
const passThroughArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--port' || arg === '-p') {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      port = rawArgs[++i];
    }
  } else if (arg.startsWith('--port=')) {
    port = arg.split('=')[1];
  } else if (arg === '--host' || arg === '-H') {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      host = rawArgs[++i];
    }
  } else if (arg.startsWith('--host=')) {
    host = arg.split('=')[1];
  } else if (/^\d+$/.test(arg)) {
    port = arg;
  } else if (/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost|0\.0\.0\.0)$/.test(arg)) {
    host = arg;
  } else {
    passThroughArgs.push(arg);
  }
}

const ngArgs = ['serve', `--host=${host}`, `--port=${port}`, ...passThroughArgs];

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['ng', ...ngArgs], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to start ng serve:', err);
  process.exit(1);
});
