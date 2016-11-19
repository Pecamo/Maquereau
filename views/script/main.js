window.onload = function () {
	onPageLoad();
}

function onPageLoad() {
	initWS();
};

function initWS() {
	var ws = new WebSocket(document.location.origin.replace(/^http/, "ws") + "/ws");

	ws._send = ws.send;
	ws.send = function (obj) {
		ws._send(angular.toJson(obj));
	}

	ws.onopen = function (event) {
		console.log("WebSocket open");
		ws.send({ type: "ping", data: { message: "echo" } });
	}

	ws.onmessage = function (event) {
		var data = JSON.parse(event.data);
		console.log(data);
	}

	ws.onclose = function (event) {
		console.warn("WebSocket closed:", event);
	}

	ws.onerror = function (event) {
		console.error("WebSocket error:", event);
	}
}
