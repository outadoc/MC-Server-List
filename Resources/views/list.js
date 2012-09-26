var win = Ti.UI.currentWindow;
var ServerHandler = require('/includes/ServerHandler');
var isMcStyle = Ti.App.Properties.getBool('mcOrigStyle', true);

var tableView = require('/includes/PullToRefresh')({
	style: Ti.UI.iPhone.TableViewStyle.PLAIN,
	scrollIndicatorStyle: Ti.UI.iPhone.ScrollIndicatorStyle.WHITE
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

	while(servers.isValidRow()) {
		var data = {
			name: servers.fieldByName('name'),
			host: servers.fieldByName('host'),
			port: servers.fieldByName('port'),
			id: servers.fieldByName('id')
		};

		//create temp row
		ServerHandler.getRow(data, function(e) {
			tableView.appendRow(e.row);
		}, ServerHandler.state.POLLING);

		//get real info
		ServerHandler.getServerInfo(data, function(e) {
			e.row.data = e.data;
			tableView.updateRow(e.data.id - 1, e.row);
		});

		servers.next();
	}

	servers.close();
}

Ti.App.addEventListener('reload', updateList);

var b_add = Ti.UI.createButton({
	image: '/img/add.png',
	backgroundImage: '/img/menubar-button.png'
});

b_add.addEventListener('click', function(e) {

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