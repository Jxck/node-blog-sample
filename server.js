var log = function(e) {console.log(e);};
var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
 	socketio = require('socket.io');

var port_local = 8080;

var load_static_file = function(uri, response) {
	// 相対パスで静的リソースを配信する。
	var tmp = uri.split('.');
	var type = tmp[tmp.length - 1];
	var filename = path.join(process.cwd(), uri);

	path.exists(filename, function(exists) {
		if (!exists) {
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('404 Not Found\n');
			response.end();
			return;
		}

		fs.readFile(filename, 'binary', function(err, file) {
			if (err) {
				response.writeHead(500, {'Content-Type': 'text/plain'});
				response.write(err + '\n');
				response.end();
				return;
			}

			switch (type) {
			case 'html':
				response.writeHead(200, {'Content-Type': 'text/html'});
				break;
			case 'js':
				response.writeHead(200, {'Content-Type': 'text/javascript'});
				break;
			case 'css':
				response.writeHead(200, {'Content-Type': 'text/css'});
				break;
			}
			response.write(file, 'binary');
			response.end();
		});
	});
};


// server
var	server = http.createServer(function(req, res) {
	var uri = url.parse(req.url).pathname;
	load_static_file(uri, res);
});

server.listen(process.env.PORT || port_local);

// websocket
var io = socketio.listen(server);

io.on('connection', function(client) {
	client.on('message', function(message) {
		//クライアントがメッセージを送って来たら実行される。
		//messageが送って来たデータ
		log(message);
		client.send(message); //送って来た本人だけに送る。
		client.broadcast(message); //送って来た人以外全員に送る。
	});
});








