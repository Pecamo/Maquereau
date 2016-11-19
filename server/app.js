'use strict'

let express = require('express')
let path = require('path')

let app = express()
let router = express.Router();
let ws = require('express-ws')(app);

app.use(router)
app.use(express.static('views/static'))

router.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

router.ws('/ws', function(ws, req) {
	ws.on('message', function(msg) {
		ws.send(msg);
	});
});

// Start the server on port 3000.
let server = app.listen(3000, () => {
	let host = server.address().address
	let port = server.address().port

	console.log('Maquereau server listening at http://%s:%s.', host, port)
})

module.exports = app
