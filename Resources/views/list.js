var win = Ti.UI.currentWindow;

var ServerHandler = require('/includes/ServerHandler');
Ti.include('/includes/lib/json.i18n.js');

var isMcStyle = Ti.App.Properties.getBool('mcStyledUI', true);

var tableView = require('/includes/PullToRefresh')({
	style: Ti.UI.iPhone.TableViewStyle.PLAIN,
	scrollIndicatorStyle: Ti.UI.iPhone.ScrollIndicatorStyle.WHITE,
	editable: true
});

if(isMcStyle) {
	tableView.setSeparatorColor('#4b4b4b');
	tableView.setBackgroundImage('/img/full-bg.png');
}

win.add(tableView);

function updateList() {
	//opening the database containing the servers that we will display
	var db = Ti.Database.open('servers');
	var servers = db.execute('SELECT * FROM servers');
	//erase the existing tableview entries
	tableView.setData([]);
	//this index corresponds to the tableviewrow id
	var i = 0;

	//loop through the servers
	while(servers.isValidRow()) {
		//getting all the data corresponding to the row, it will be useful later
		var data = {
			name: servers.fieldByName('name'),
			host: servers.fieldByName('host'),
			port: servers.fieldByName('port'),
			sqlid: servers.fieldByName('id'),
			id: i
		};

		//create temporary row, that will say "polling server..."
		ServerHandler.getRow(data, i, function(e) {
			tableView.appendRow(e.row);
		}, ServerHandler.state.POLLING);

		//get real info
		ServerHandler.getServerInfo(data, i, function(e) {
			e.row.data = e.data;
			//update the existing temporary row and update it in consequence
			tableView.updateRow(e.index, e.row);
		});

		//next server, next row
		servers.next();
		i++;
	}

	//we're done with the database
	servers.close();
}

Ti.App.addEventListener('reload', updateList);

tableView.addEventListener('delete', function(e) {
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
		url: 'add.js',
		title: I('addServer.title'),
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png'
	});

	win_add.addEventListener('close', function(e) {
		updateList();
	});

	win_add.open({
		modal: true
	});
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

var b_info_win = Ti.UI.createButton({
	style: (isMcStyle) ? Ti.UI.iPhone.SystemButton.INFO_LIGHT : Ti.UI.iPhone.SystemButton.INFO_DARK,
	bottom: 10,
	right: 10
});

b_info_win.addEventListener('click', function(e) {
	var win_info = Ti.UI.createWindow({
		title: 'Credits',
		url: 'credits.js'
	});

	win_info.open({
		modal: true
	});
});

win.add(b_info_win);
updateList();
