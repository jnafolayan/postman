#!/usr/bin/env node

const { exec } = require('child_process');

exec('start chrome ./index.html', {
	shell: true,
	stdout: process.stdout
});