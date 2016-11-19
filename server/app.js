'use strict';

let express = require('express');
let path = require('path');
let fs = require('fs');

let app = express();
let router = express.Router();
let ws = require('express-ws')(app);

let robot = require('robotjs');

let getFocusProcess = require('./get-focus-process');

app.use(router);
app.use(express.static('views/static'));

let similarProcesses = {
	"chromium": "chrome"
};

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
					ws.send(JSON.stringify({
						type: "process-changed",
						data: {
							name: currentProcess
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

					let fileName = __dirname + '/processes/' + processName + '.json';

					if (fs.existsSync(fileName)) {
						let fileContent = JSON.parse(fs.readFileSync(fileName, 'utf8'));
						let payload = JSON.stringify({type: 'layout', data: fileContent});
						ws.send(payload);
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
function processWatcher() {
	setInterval(function () {
		getFocusProcess(function (process) {
			if (currentProcess !== process) {
				currentProcess = process;

				for (let client of ws.getWss().clients) {
					client.send(JSON.stringify({
						type: "process-changed",
						data: {
							name: process
						}
					}));
				}
			}
		})
	}, 500);
}

processWatcher();

// Start the server on port 3000.
let server = app.listen(3000, () => {
	let host = server.address().address;
	let port = server.address().port;

	console.log('Maquereau server listening at http://%s:%s.', host, port)
});

module.exports = app;
