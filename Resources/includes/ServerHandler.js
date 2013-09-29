exports.init = function(name, host, port) {
	//initialize the object with the info regarding the server
	exports.data = {};
	exports.data.name = name;
	exports.data.host = host;

	if(port != null) {
		exports.data.port = port;
	} else {
		exports.data.port = 25565;
	}
}
//called when we want to poll the server and get its info
exports.getServerInfo = function(data, index, callback) {
	//make sur the port is not empty, and it's 25565 by default
	data.port = (data.port == null) ? 25565 : data.port;

	//this will help us calculate the ping afterwards
	var timestamp = (new Date).getTime();
	var ping = 0;

	//the socket used to communicate with the server
	var socket = Ti.Network.Socket.createTCP({
		host: data.host,
		port: data.port,
		timeout: 5000,
		//when we're connected
		connected: function(e) {
			//this will catch any info the server throws us
			Ti.Stream.pump(e.socket, readCallback, 256, true);
			
			//send him a 0xFE
			Ti.Stream.write(e.socket, Ti.createBuffer({
				value: 0xFE,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.TYPE_BYTE
			}), function() {
				//calculate the ping
				ping = (new Date).getTime() - timestamp;
			});
			
			/*var mainBuffer = Ti.createBuffer({
				value: 0xFA,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.TYPE_BYTE
			});
			
			mainBuffer.append(Ti.createBuffer({
				value: "MC|PingHost",
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.CHARSET_UTF16BE
			}));
			
			var pluginMessageData = Ti.createBuffer({
				value: 74,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.TYPE_BYTE
			});
			
			pluginMessageData.append(Ti.createBuffer({
				value: data.host,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.CHARSET_UTF16BE
			}));
			
			pluginMessageData.append(Ti.createBuffer({
				value: data.port,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.TYPE_INT
			}));
			
			mainBuffer.append(Ti.createBuffer({
				value: pluginMessageData.length,
				byteOrder: Ti.Codec.BIG_ENDIAN,
				type: Ti.Codec.TYPE_SHORT
			}));
			
			mainBuffer.append(pluginMessageData);
			Ti.Stream.write(e.socket, mainBuffer, function() {
				
			});*/
		},
		error: function(e) {
			exports.getRow(data, index, callback, exports.state.ERROR);
		}
	});

	//when we get something from the server
	function readCallback(e) {
		try {
			//if the buffer isn't empty
			if(e.buffer) {
				//if the server sent us a 0xFF
				if(e.buffer[0] == 0xFF) {
					e.source.close();

					//result is the raw string of info the server gives us
					var result = Ti.Codec.decodeString({
						source: e.buffer,
						position: 3,
						length: e.buffer.length - 3,
						charset: Ti.Codec.CHARSET_UTF16BE
					});
					
					//parse this info string into an array
					var infoArray = result.match(/(.*)§([0-9]*)§([0-9]*)$/);
					
					//insert the info we got into the data object
					data.desc = infoArray[1].replace(/§[0-9a-zA-Z]/g, '');
					data.disp = infoArray[2];
					data.max = infoArray[3];
					data.ping = ping;

					//send this data to the getRow method so it can make a row out of it
					exports.getRow(data, index, callback, exports.state.SUCCESS);
				}
			} else {
				//if the buffer was empty, make an error row
				exports.getRow(data, index, callback, exports.state.ERROR);
			}
		} catch (ex) {
			//if something else went wrong, make an error row
			exports.getRow(data, index, callback, exports.state.ERROR);
		}
	}

	//begin connection to the server!
	socket.connect();
}
//this method takes the info we got from the server (or not, if it's a temporary row) and turns it into a fancy tableviewrow
exports.getRow = function(data, index, callback, state) {
	//first, create the row
	var row = Ti.UI.createTableViewRow({
		height: Ti.UI.SIZE,
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});
	
	var view_container_info = Ti.UI.createView({
		layout: 'vertical',
		height: Ti.UI.SIZE,
		top: 5,
		bottom: 5
	});
	
	row.add(view_container_info);

	//name of the server
	var lbl_name = Ti.UI.createLabel({
		text: data.name,
		color: 'black',
		left: 10,
		width: 250,
		height: 19
	});

	view_container_info.add(lbl_name);

	//ping of the server
	var lbl_ping = Ti.UI.createLabel({
		text: (state == exports.state.ERROR) ? '0 ms' : data.ping + ' ms',
		color: 'gray',
		font: {
			fontSize: 16
		},
		top: 5,
		right: 10
	});

	row.add(lbl_ping);

	//description of the server
	var lbl_desc = Ti.UI.createLabel({
		font: {
			fontSize: 16
		},
		height: Ti.UI.SIZE,
		width: 250,
		left: 10
	});

	view_container_info.add(lbl_desc);

	//number of slots available
	var lbl_slots = Ti.UI.createLabel({
		text: (state == exports.state.ERROR) ? '??/??' : data.disp + '/' + data.max,
		color: 'gray',
		font: {
			fontSize: 16
		},
		top: 25,
		right: 10
	});

	row.add(lbl_slots);

	//ip address of the server
	var lbl_host = Ti.UI.createLabel({
		text: (data.port == 25565) ? data.host : (data.host + ':' + data.port),
		color: 'lightGray',
		font: {
			fontSize: 16
		},
		left: 10
	});

	view_container_info.add(lbl_host);

	//fix the labels depending on the state
	if(state == exports.state.ERROR) {
		//if something went wrong, show an error message instead of the description
		lbl_desc.setText(I('main.item.error'));
	} else if(state == exports.state.POLLING) {
		//if we're only polling the server, set its description to this
		lbl_desc.setText(I('main.item.polling'));
		//and hide ping and slots availability, they're useless in this situation
		lbl_ping.setVisible(false);
		lbl_slots.setVisible(false);
		//show a spinning wheel to indicate it's trying to fetch information from the server
		var indicator = Ti.UI.createActivityIndicator({
			right: 10,
			style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
		});
		row.add(indicator);
		indicator.show();
	} else {
		//if everything worked out, set the description to its legitimate value
		lbl_desc.setText(data.desc);
	}

	//setting the right colors following the state
	if(state == exports.state.ERROR) {
		//if it's an error, make it bloody
		lbl_desc.setColor('red');
	} else {
		lbl_desc.setColor('gray');
	}

	//finally, send the row to the callback method so it can be added to the tableview where it belongs
	callback({
		row: row,
		index: index,
		data: data
	});
}
//when there are no rows in the database, add some info on how to add a server
exports.getEmptyPlaceholderRow = function() {
	var row = Ti.UI.createTableViewRow({
		editable: false,
		isPlaceholder: true,
		height: 75,
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
		backgroundColor: 'transparent'
	});

	var lbl_title = Ti.UI.createLabel({
		text: I('main.noContent.title'),
		font: {
			fontWeight: 'bold',
			fontSize: 17
		},
		color: 'black',
		top: 5,
		left: 10,
		right: 10,
		width: Ti.UI.SIZE,
		height: Ti.UI.SIZE
	});

	row.add(lbl_title);

	var lbl_help = Ti.UI.createLabel({
		text: I('main.noContent.help'),
		top: 29,
		bottom: 8,
		left: 10,
		right: 10,
		font: {
			fontSize: 15
		},
		color: 'lightgray',
		height: Ti.UI.SIZE,
		width: Ti.UI.FILL
	});

	row.add(lbl_help);
	return row;
}
//definition of the states
exports.state = {
	POLLING: 0, //when fetching info from the server
	ERROR: 1, //when something wrong happened
	SUCCESS: 2 //when everything rules
}