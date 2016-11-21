'use strict';

const exec = require('child_process').exec;

const regexPattern = new RegExp(/(?:[\d\.]+\s+){6,7}((?:\s?\w+)+)/);

function countOcurrences(str, value) {
	var regExp = new RegExp(value, "gi");
	return (str.match(regExp) || []).length;
}

var rnRecieved = 3;

function getFocusProcess (cb) {
	if (process.platform.toLowerCase().includes('win')) {
		let command = 'C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -ExecutionPolicy ByPass -File "windowsproc.ps1"';
		let proc = exec(command);

		proc.stdout.on('data', (data) => {
			rnRecieved += countOcurrences(data, "\r\n");
			var found = data.match(regexPattern);
			if (found) {
				if (rnRecieved >= 3) {
					// console.log(found[1].trim());
					cb(found[1].trim());
					rnRecieved = 0;
				} else {
					// console.log("Preventing too many applications switches.");
					rnRecieved = 0;
				}
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
