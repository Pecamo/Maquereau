'use strict';

const exec = require('child_process').exec;

const regexPattern = new RegExp(/(?:[\d\.]+\s+){7}((?:\s?\w+)+)/);

function getFocusProcess (cb) {
	if (process.platform.toLowerCase().includes('win')) {
		let command = 'C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\powershell.exe . "./windowsproc.ps1";';
		let proc = exec(command);

		proc.stdout.on('data', (data) => {
			var found = data.match(regexPattern);
			if (found) {
				console.log(found[1].trim());
				cb(found[1].trim());
			}
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
