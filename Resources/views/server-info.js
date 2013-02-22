var win = Ti.UI.currentWindow;
Ti.include('/includes/lib/json.i18n.js');

var b_close = Ti.UI.createButton({
	systemButton: Ti.UI.iPhone.SystemButton.CANCEL
});

b_close.addEventListener('click', function(e) {
	win.close();
});

win.setLeftNavButton(b_close);

var lbl_name = Ti.UI.createLabel({
	text: I('addServer.labels.name.title'),
	color: 'white',
	left: 20,
	top: 20
});

win.add(lbl_name);

var txtfield_name = Ti.UI.createTextField({
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText: I('addServer.labels.name.placeholder'),
	left: 20,
	right: 20,
	top: 50,
	height: 38,
	returnKeyType: Ti.UI.RETURNKEY_NEXT
});

win.add(txtfield_name);

var lbl_host = Ti.UI.createLabel({
	text: I('addServer.labels.host.title'),
	color: 'white',
	left: 20,
	top: 100
});

win.add(lbl_host);

var txtfield_host = Ti.UI.createTextField({
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	hintText: I('addServer.labels.host.placeholder'),
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
	autocorrect: false,
	keyboardType: Ti.UI.KEYBOARD_URL,
	left: 20,
	right: 130,
	top: 130,
	height: 38,
	returnKeyType: Ti.UI.RETURNKEY_NEXT
});

win.add(txtfield_host);

var lbl_port = Ti.UI.createLabel({
	text: I('addServer.labels.port.title'),
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
	systemButton: Ti.UI.iPhone.SystemButton.DONE
});

b_done.addEventListener('click', function(e) {
	if(txtfield_name.getValue() == '' || txtfield_host.getValue() == '') {
		(Ti.UI.createAlertDialog({
				title: I('addServer.confirm.error.title'),
				message: I('addServer.confirm.error.message')
			})).show();
	} else {
		if(win.serverIDToEdit != null) {
			var db = Ti.Database.open('servers');
			db.execute('UPDATE servers SET name=?, host=?, port=? WHERE id=?', txtfield_name.getValue(), txtfield_host.getValue(), (txtfield_port.getValue() == '') ? 25565 : txtfield_port.getValue(), win.serverIDToEdit);
			db.close();
		} else {
			var db = Ti.Database.open('servers');
			db.execute('INSERT INTO servers (name, host, port) VALUES(?, ?, ?)', txtfield_name.getValue(), txtfield_host.getValue(), (txtfield_port.getValue() == '') ? 25565 : txtfield_port.getValue());
			db.close();
	
			(Ti.UI.createAlertDialog({
					title: I('addServer.confirm.success.title'),
					message: I('addServer.confirm.success.message'),
					buttonNames: [I('addServer.confirm.success.okButton')]
				})).show();
		}
		
		win.close();
	}
});

win.setRightNavButton(b_done);

//if we're editing a server and not actually creating a new one
if(win.serverIDToEdit != null) {
	var db = Ti.Database.open('servers');
	var servers = db.execute('SELECT * FROM servers WHERE id=?', win.serverIDToEdit);
	
	if(servers.rowCount != 0) {
		txtfield_name.setValue(servers.fieldByName('name'));
		txtfield_host.setValue(servers.fieldByName('host'));
		txtfield_port.setValue(servers.fieldByName('port'));
	}
	
	db.close();
}

win.addEventListener('postlayout', function() {
	txtfield_name.addEventListener('return', function(e) {
		txtfield_host.focus();
	});
	txtfield_host.addEventListener('return', function(e) {
		txtfield_port.focus();
	});

	txtfield_name.focus();
});
