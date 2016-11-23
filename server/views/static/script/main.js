var ws;
var useOSX;

var vm = new Vue({
	el: '#container',
	data: {
		connected: false,
		currentProcess: "Connecting...",
		containerStyle: {},
		tiles: [
			{
				"title":"Connecting",
				"subtitle":"Please wait while the device is connecting to your desktop...",
				"background-color":{
					"static":"#00FF00"
				},
				"icon":"new-tab.png",
				"width":1,
				"height":1,
				"action":{
					"sendKeyStroke":[

					]
				}
			}
		]
	},
	methods: {
		onTileClicked: function (action, actionOSX, event) {
			if (!useOSX) {
				try {
					if (action.sendKeyStroke) {
						ws.send({
							type: 'keystroke',
							data: {
								'keys': action.sendKeyStroke
							}
						});
					}
				} catch (err) {
					console.error("Button might have only OSX binding. Error : " + err);
				}
			} else {
				try {
					if (actionOSX.sendKeyStroke) {
						ws.send({
							type: 'keystroke',
							data: {
								'keys': actionOSX.sendKeyStroke
							}
						});
					}
				} catch (err) {
					console.error("Button might not have OSX binding. Error : " + err);
				}
			}
		},
		altTab: function () {
			if (!useOSX) {
				ws.send({
					type: 'keystroke',
					data: {
						'keys': [['alt', 'tab']]
					}
				});
			} else {
				ws.send({
					type: 'keystroke',
					data: {
						'keys': [['command', 'tab']]
					}
				});
			}
		},
		altShiftTab: function () {
			if (!useOSX) {
				ws.send({
					type: 'keystroke',
					data: {
						'keys': [['alt', 'shift', 'tab']]
					}
				});
			} else {
				ws.send({
					type: 'keystroke',
					data: {
						'keys': [['command', 'shift', 'tab']]
					}
				});
			}
		}
	}
});

window.onload = function () {
	onPageLoad();
};

function onPageLoad() {
	initWS();
	useOSX = false;
}

function initWS() {
	ws = new ReconnectingWebSocket(document.location.origin.replace(/^http/, "ws") + "/ws");

	ws._send = ws.send;
	ws.send = function (obj) {
		ws._send(JSON.stringify(obj));
	};

	ws.onopen = function (event) {
		vm.connected = true;
		ws.send({ type: 'hello', data: {} });
	};

	ws.onmessage = function (event) {
		var message = JSON.parse(event.data);

		switch (message.type) {
			case 'pong':
				console.log("Pong:", message.data);
				break;
			case 'process-changed':
				// TODO put layouts in cache and try to recover them
				queryLayout(message.data.name);

				useOSX = message.data.useOSX;

				if (message.data.title) {
					vm.currentProcess = message.data.title;
				}

				console.log(message.data);

				if (message.data.style) {
					vm.containerStyle = message.data.style;
				}

				break;
			case 'layout':
				vm.tiles = message.data.tiles;
				break;
			default:
				console.warn('Unhandled message:', message);
				break;
		}
	};

	ws.onclose = function (event) {
		console.warn("WebSocket closed:", event);
		vm.connected = false;
		vm.currentProcess = "Disconnected";
	};

	ws.onerror = function (event) {
		console.error("WebSocket error:", event);
	}
}

function queryLayout(process) {
	console.log('Querying layout', process);
	ws.send({ type: 'layout-request', data: { process: process } });
}
