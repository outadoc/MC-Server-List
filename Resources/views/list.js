var win = Ti.UI.currentWindow;
var ServerHandler = require('/includes/ServerHandler');
var isMcStyle = Ti.App.Properties.getBool('mcOrigStyle', true);

var tableView = require('/includes/PullToRefresh')({
	style: Ti.UI.iPhone.TableViewStyle.PLAIN,
	scrollIndicatorStyle: Ti.UI.iPhone.ScrollIndicatorStyle.WHITE,
	editable: true
});

if(isMcStyle) {
	tableView.setSeparatorColor('#4b4b4b');
	tableView.setBackgroundImage('/img/row-bg.png');
}

win.add(tableView);

function updateList() {
	var db = Ti.Database.open('servers');
	var servers = db.execute('SELECT * FROM servers');
	tableView.setData([]);
	var i = 0;

	while(servers.isValidRow()) {
		var data = {
			name: servers.fieldByName('name'),
			host: servers.fieldByName('host'),
			port: servers.fieldByName('port'),
			sqlid: servers.fieldByName('id'),
			id: i
		};

		//create temp row
		ServerHandler.getRow(data, i, function(e) {
			tableView.appendRow(e.row);
		}, ServerHandler.state.POLLING);

		//get real info
		ServerHandler.getServerInfo(data, i, function(e) {
			e.row.data = e.data;
			tableView.updateRow(e.index, e.row);
		});

		servers.next();
		i++;
	}

	servers.close();
}

Ti.App.addEventListener('reload', updateList);

tableView.addEventListener('delete', function(e) {
	//console.log('deleting id ' + e.rowData.id)
	var db = Ti.Database.open('servers');
	db.execute('DELETE FROM servers WHERE id=?', e.rowData.data.sqlid);
	db.close();
});

var b_add = Ti.UI.createButton({
	image: '/img/add.png',
	backgroundImage: '/img/menubar-button.png'
});

b_add.addEventListener('click', function(e) {
	var win_add = Ti.UI.createWindow({
		url: 'subviews/add.js',
		title: 'Add a server',
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png',
		modal: true
	});

	win_add.addEventListener('close', function(e) {
		updateList();
	});

	win_add.open();
});

var b_edit = Ti.UI.createButton({
	image: '/img/edit.png',
	backgroundImage: '/img/menubar-button.png'
});

b_edit.addEventListener('click', function(e) {
	if(!tableView.getEditing()) {
		tableView.setEditing(true);
	} else {
		tableView.setEditing(false);
	}
});

win.setRightNavButton(b_add);
win.setLeftNavButton(b_edit);

updateList();
