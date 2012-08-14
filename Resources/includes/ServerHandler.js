exports.init = function(name, host, port) {
	exports.data = {};
	exports.data.name = name;
	exports.data.host = host;

	if(port != null) {
		exports.data.port = port;
	} else {
		exports.data.port = 25565;
	}

	console.log(exports.data)
}

exports.getServerInfo = function(data, callback) {
	data.port = (data.port == null) ? 25565 : port

	var timestamp = (new Date).getTime();
	var ping = 0;

	var socket = Ti.Network.Socket.createTCP({
		host: data.host,
		port: data.port,
		timeout: 5000,
		connected: function(e) {
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
			exports.getRow(data, callback, exports.state.ERROR);
		}
	});

	function readCallback(e) {
		try {
			if(e.buffer) {
				if(e.buffer[0] == 0xFF) {
					e.source.close();

					var result = Ti.Codec.decodeString({
						source: e.buffer,
						position: 3,
						length: e.buffer.length - 3,
						charset: Ti.Codec.CHARSET_UTF16BE
					});

					var infoArray = result.split('§');

					data.desc = infoArray[0];
					data.disp = infoArray[1];
					data.max = infoArray[2];
					data.ping = ping;

					exports.getRow(data, callback, exports.state.SUCCESS);
				}
			} else {
				exports.getRow(data, callback, exports.state.ERROR);
			}
		} catch (ex) {
			exports.getRow(data, callback, exports.state.ERROR);
		}
	}


	socket.connect();
}

exports.getRow = function(data, callback, state) {
	var row = Ti.UI.createTableViewRow({
		height: 75,
		backgroundImage: '/img/row-bg.png',
		//backgroundSelectedImage: '/img/row-bg-selected.png',
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});

	var lbl_name = Ti.UI.createLabel({
		text: data.name,
		color: 'white',
		top: 5,
		left: 10,
		width: 250,
		height: 19
	});

	row.add(lbl_name);

	var lbl_ping = Ti.UI.createLabel({
		text: (state == exports.state.ERROR) ? '0 ms' : data.ping + ' ms',
		color: 'lightGray',
		font: {
			fontSize: 16
		},
		top: 5,
		right: 10
	});

	row.add(lbl_ping);

	var lbl_desc = Ti.UI.createLabel({
		color: (state == exports.state.ERROR) ? 'red' : 'lightGray',
		font: {
			fontSize: 16
		},
		height: 17,
		width: 250,
		top: 26,
		left: 10
	});

	row.add(lbl_desc);

	var lbl_slots = Ti.UI.createLabel({
		text: (state == exports.state.ERROR) ? '??/??' : data.disp + '/' + data.max,
		color: 'lightGray',
		font: {
			fontSize: 16
		},
		top: 25,
		right: 10
	});

	row.add(lbl_slots);

	var lbl_host = Ti.UI.createLabel({
		text: data.host,
		color: '#4b4b4b',
		font: {
			fontSize: 16
		},
		bottom: 10,
		left: 10
	});

	row.add(lbl_host);
	
	//fixes depending on the state
	if(state == exports.state.ERROR) {
		lbl_desc.setText('Can\'t reach server');
	} else if(state == exports.state.POLLING) {
		lbl_desc.setText('Polling server...');
		lbl_ping.setVisible(false);
		lbl_slots.setVisible(false);
		var indicator = Ti.UI.createActivityIndicator({
			right:10,
			style: Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
		});
		row.add(indicator);
		indicator.show();
	} else {
		lbl_desc.setText(data.desc);
	}

	callback({
		row: row,
		data: data
	});
}

exports.state = {
	POLLING: 0,
	ERROR: 1,
	SUCCESS: 2
}