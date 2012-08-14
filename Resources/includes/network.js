function getServerInfo(ip, port, callback) {
	if(port == null) {
		port = 25565;
	}
	
	var timestamp = (new Date).getTime();
	var ping = 0;
	
	var socket = Ti.Network.Socket.createTCP({
		host: ip,
		port: port,
		connected: function(e) {
			Ti.API.info('Socket opened!');

			Ti.Stream.pump(e.socket, readCallback, 256, true);
			Ti.Stream.write(e.socket, Ti.createBuffer({
				value: 0xFE,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.TYPE_BYTE
			}), function() {
				ping = (new Date).getTime() - timestamp;
			});
		},
		error: function(e) {
			alert('Could not retrieve info for server ' + ip + ':' + port + '(' + e + ')');
		}
	});

	function readCallback(e) {
		try {
			if(e.buffer) {
				if(e.buffer[0] == 0xFF) {
					Ti.API.info('got a 0xff disconnect');
					e.source.close();

					var result = Ti.Codec.decodeString({
						source: e.buffer,
						position: 3,
						length: e.buffer.length - 3,
						charset: Ti.Codec.CHARSET_UTF16BE
					});

					var infoArray = result.split('§');

					callback({
						host: ip,
						desc: infoArray[0],
						disp: infoArray[1],
						total: infoArray[2],
						ping: ping
					});
				}
			} else {
				alert('Error: read callback called with no buffer!');
			}
		} catch (ex) {
			alert(ex);
		}
	}

	socket.connect();
}