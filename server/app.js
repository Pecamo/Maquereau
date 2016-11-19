'use strict';

let express = require('express');
let path = require('path');
let fs = require('fs');

let app = express();
let router = express.Router();
let ws = require('express-ws')(app);

var robot = require("robotjs");

app.use(router);
app.use(express.static('views/static'));

let similarProcesses = {
	"chromium" : "chrome"
};

router.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

router.ws('/ws', function (ws, req) {
	ws.on('message', function (msg) {
		msg = JSON.parse(msg);

		if (!msg.error) {
			switch (msg.type) {
				case 'keystroke':
					for (let key of msg.data.keys) {
						robot.keyTap(key);
					}
					break;

				case 'layout-request':
					var processName = msg.data.process;
					if (processName in similarProcesses) {
						processName = similarProcesses[processName];
					}
					var fileName = __dirname + '/processes/' + processName + '.json';
					var fileContent = JSON.parse(fs.readFileSync(fileName, 'utf8'));
					var payload = JSON.stringify({type: 'layout', data: fileContent});
					ws.send(payload);
			}
		} else {
			console.error(msg.error);
		}
	});
});

// Start the server on port 3000.
let server = app.listen(3000, () => {
	let host = server.address().address;
	let port = server.address().port;

	console.log('Maquereau server listening at http://%s:%s.', host, port)
});

module.exports = app;
