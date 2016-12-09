'use strict';

let express = require('express');
let path = require('path');
let fs = require('fs');
let os = require('os');

let qr = require('qr-image');
let open = require('open');

let app = express();
let router = express.Router();
let ws = require('express-ws')(app);
let ifaces = os.networkInterfaces();

let robot = require('robotjs');

let out = process.stdout;

let getFocusProcess = require('./get-focus-process');

let titleOf = {
	"Google Chrome" : "Google Chrome",
	"chrome" : "Google Chrome",
	"chromium" : "Google Chrome",
	"POWERPNT" : "PowerPoint",
	"pycharm64" : "PyCharm"
};

function styleOf(name) {
	let fileName = __dirname + '/styles/' + name + '.json';
	if (fs.existsSync(fileName)) {
		return JSON.parse(fs.readFileSync(fileName, 'utf8'));
	} else {
		return {};
	}
}

app.use(router);
app.use(express.static('views/static'));

let similarProcesses = {
	"Google Chrome" : "chrome",
	"chromium": "chrome",
	"PyCharm": "WebStorm",
	"pycharm64": "WebStorm",
	"idea": "WebStorm"
};

let useOSX = process.platform.toLowerCase().includes('darwin');

router.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

router.ws('/ws', function (ws, req) {
	ws.on('message', function (msg) {
		msg = JSON.parse(msg);

		if (!msg.error) {
			switch (msg.type) {
				case 'ping':
					msg.type = 'pong';
					ws.send(JSON.stringify(msg));
					break;
				case 'hello':
					let title = (typeof titleOf[currentProcess] !== 'undefined') ? titleOf[currentProcess] : currentProcess;

					ws.send(JSON.stringify({
						type: "process-changed",
						data: {
							name: currentProcess,
							title: title,
							style: styleOf(currentProcess),
							useOSX: useOSX
						}
					}));
					break;
				case 'keystroke':
					for (let combinations of msg.data.keys) {
						if (typeof combinations === 'string') {
							robot.keyTap(combinations);
						} else {
							let key = combinations.pop();
							robot.keyTap(key, combinations);
						}
					}
					break;

				case 'layout-request':
					let processName = msg.data.process;

					if (processName in similarProcesses) {
						processName = similarProcesses[processName];
					}

					let fileName = __dirname + '/layouts/' + processName + '.json';

					if (fs.existsSync(fileName)) {
						try {
							let fileContent = JSON.parse(fs.readFileSync(fileName, 'utf8'));
							let payload = JSON.stringify({type: 'layout', data: fileContent});
							ws.send(payload);
						} catch (e) {
							console.error('Error probably while reading Json file: ' + fileName);
							console.error(e);
						}
					} else {
						console.warn('Layout for "' + processName + '" doesn\'t exists');
					}
			}
		} else {
			console.error(msg.error);
		}
	});
});

let currentProcess = "";
const timeInterval = 500;
let isWindows = (process.platform.toLowerCase().includes('win')) && !(process.platform.toLowerCase().includes('darwin'));

function processWatcher() {
	getFocusProcess(function (process) {
		if (currentProcess !== process) {
			currentProcess = process;

			let title = (typeof titleOf[process] !== 'undefined') ? titleOf[process] : process;

			for (let client of ws.getWss().clients) {
				client.send(JSON.stringify({
					type: "process-changed",
					data: {
						name: process,
						title: title,
						style: styleOf(process),
						useOSX: useOSX
					}
				}));
			}
		}
		out.clearLine();
		out.cursorTo(0);
		out.write("Current process : " + process);
		if (!isWindows) {
			setTimeout(processWatcher, timeInterval);
		}
	});
}

setTimeout(processWatcher, timeInterval);

// Start the server on port 3000.
let server = app.listen(3000, () => {
	let host = server.address().address;
	let port = server.address().port;

	console.log('Maquereau server listening at http://%s:%s.', host, port);

	Object.keys(ifaces).forEach(function (ifname) {
		let alias = 0;
		let localIps = [];
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}
			if (alias >= 1) {
				// this single interface has multiple ipv4 addresses
				console.log(ifname + ':' + alias, iface.address + ":" + port);
				localIps.push(iface.address);
			} else {
				// this interface has only one ipv4 adress
				console.log(ifname, iface.address + ":" + port);
				localIps.push(iface.address);
			}
			++alias;
		});

		let i = 0;
		var qr_png;
		var svg_string;
		localIps.forEach(function (localIp) {
			qr_png = qr.image(localIp + ":" + port, { type: 'png' });
			qr_png.pipe(fs.createWriteStream('scan_me_' + i + '.png'));
			svg_string = qr.imageSync('localIp + ":" + port', { type: 'png' });
			i++
		});
	});
	open('file://' + __dirname + path.sep + 'scan_me_' + 0 + '.png', 'chrome');
});

module.exports = app;
