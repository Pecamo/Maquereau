'use strict';

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

const regexPattern = new RegExp(/(?:[\d\.]+\s+){6,7}((?:\s?\w+)+)/);

function getFocusProcess (cb) {
	// OS X
	if (process.platform.toLowerCase().includes('darwin')) {
		let proc = exec('osascript osxproc.scpt');
		proc.stdout.on('data', (data) => {
			cb(data.trim());
		});

		proc.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});

		proc.on('close', (code) => {
		});

	// Windows
	} else if (process.platform.toLowerCase().includes('win')) {
		let child = spawn("powershell.exe",["-ExecutionPolicy", "ByPass", "-File", "windowsproc.ps1"]);
		child.stdout.on("data",function(data){
			var found = data.toString().match(regexPattern);
			if (found) {
				cb(found[1].trim());
			}
		});

		child.stderr.on("data",function(data){
			console.log("Powershell error : " + data);
		});

		child.on("exit",function(){
			console.log("Powershell script finished");
		});

		child.stdin.end();

	// Linux
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
