var ws;

var vm = new Vue({
	el: '#container',
	data: {
		currentProcess: "",
		tiles: [
			{
				"title":{
					"static":"New"
				},
				"subtitle":{
					"static":"Opens a new tab"
				},
				"background-color":{
					"static":"#00FF00"
				},
				"enable":{
					"static":true
				},
				"icon":{
					"static":"new-tab.png"
				},
				"width":2,
				"height":1,
				"action":{
					"sendKeyStroke":[
						"Ctrl",
						"T"
					]
				}
			}
		]
	},
	methods: {
		onTileClicked: function (action, event) {
			if (action.sendKeyStroke) {
				ws.send({
					type: 'keystroke',
					data: {
						'keys': action.sendKeyStroke
					}
				});
			}
		}
	}
})

window.onload = function () {
	onPageLoad();
}

function onPageLoad() {
	initWS();
};

function initWS() {
	ws = new WebSocket(document.location.origin.replace(/^http/, "ws") + "/ws");

	ws._send = ws.send;
	ws.send = function (obj) {
		ws._send(JSON.stringify(obj));
	}

	ws.onopen = function (event) {
		ws.send({ type: 'hello', data: {} });
	}

	ws.onmessage = function (event) {
		var message = JSON.parse(event.data);

		switch (message.type) {
			case 'pong':
				console.log("Pong:", message.data);
				break;
			case 'process-changed':
				// TODO put layouts in cache and try to recover them
				queryLayout(message.data.name);
				vm.currentProcess = message.data.name;
				break;
			case 'layout':
				vm.tiles = message.data.tiles;
				break;
			default:
				console.warn('Unhandled message:', message);
				break;
		}
	}

	ws.onclose = function (event) {
		console.warn("WebSocket closed:", event);
	}

	ws.onerror = function (event) {
		console.error("WebSocket error:", event);
	}
}

function queryLayout(process) {
	console.log('Querying layout', process);
	ws.send({ type: 'layout-request', data: { process: process } });
}
