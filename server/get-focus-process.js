'use strict';

const exec = require('child_process').exec;

function getFocusProcess (cb) {
	if (process.platform.toLowerCase().includes('win')) {
		let command = 'C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\powershell.exe . "./windowsproc.ps1";'
		let proc = exec(command);

		proc.stdout.on('data', (data) => {
			cb(data.trim());
		});

		proc.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});

		proc.on('close', (code) => {
		});
	} else if (process.platform.toLowerCase().includes('linux')) {
		let proc = exec('ps -p $(xdotool getactivewindow getwindowpid) -o comm=');

		proc.stdout.on('data', (data) => {
			cb(data.trim());
		});

		proc.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});

		proc.on('close', (code) => {
		});
	}
}

module.exports = getFocusProcess;
