var win = Ti.UI.currentWindow;

var b_close = Ti.UI.createButton({
	backgroundImage: '/img/menubar-button.png',
	image: '/img/back.png'
});

b_close.addEventListener('click', function(e) {
	win.close();
});

win.setLeftNavButton(b_close);

var lbl_name = Ti.UI.createLabel({
	text: 'Name of the server:',
	color: 'white',
	left: 20,
	top: 20
});

win.add(lbl_name);

var txtfield_name = Ti.UI.createTextField({
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText: 'My Awesome Server',
	left: 20,
	right: 20,
	top: 50,
	height: 38
});

win.add(txtfield_name);

var lbl_host = Ti.UI.createLabel({
	text: 'Host (IP address):',
	color: 'white',
	left: 20,
	top: 100
});

win.add(lbl_host);

var txtfield_host = Ti.UI.createTextField({
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText: 'server.example.com',
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
	autocorrect: false,
	keyboardType: Ti.UI.KEYBOARD_URL,
	left: 20,
	right: 130,
	top: 130,
	height: 38
});

win.add(txtfield_host);

var lbl_port = Ti.UI.createLabel({
	text: 'Port:',
	color: 'white',
	left: 200,
	top: 100
});

win.add(lbl_port);

var txtfield_port = Ti.UI.createTextField({
	keyboardType: Ti.UI.KEYBOARD_NUMBER_PAD,
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText: '25565',
	right: 20,
	left: 200,
	top: 130,
	height: 38
});

win.add(txtfield_port);

var b_done = Ti.UI.createButton({
	image: '/img/check.png',
	backgroundImage: '/img/menubar-button.png'
});

b_done.addEventListener('click', function(e) {
	if(txtfield_name.getValue() == '' || txtfield_host.getValue() == '') {
		(Ti.UI.createAlertDialog({
			title: 'Not so fast!',
			message: 'You need to specify at least the "name" and "host" fields to proceed.'
		})).show();
	} else {
		var db = Ti.Database.open('servers');
		db.execute('INSERT INTO servers (name, host, port) VALUES(?, ?, ?)', txtfield_name.getValue(), txtfield_host.getValue(), txtfield_port.getValue());
		(Ti.UI.createAlertDialog({
			title: 'Success!',
			message: 'Successfully added the server to the database.',
			buttonNames: ['Thanks <3']
		})).show();
	}
});

win.setRightNavButton(b_done);
