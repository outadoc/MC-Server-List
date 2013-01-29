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

var view_footer = Ti.UI.createView({
	left: 0,
	right: 0,
	height: 55
});

tableView.setFooterView(view_footer);
win.add(tableView);

function updateList() {
	//opening the database containing the servers that we will display
	var db = Ti.Database.open('servers');
	var servers = db.execute('SELECT * FROM servers');
	//erase the existing tableview entries
	tableView.setData([]);
	//this index corresponds to the tableviewrow id
	var i = 0;

	if(servers.rowCount < 1) {
		tableView.appendRow(ServerHandler.getEmptyPlaceholderRow());
	} else {
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

			try {
				//create temporary row, that will say "polling server..."
				ServerHandler.getRow(data, i, function(e) {
					tableView.appendRow(e.row);
				}, ServerHandler.state.POLLING);

				//get real info
				ServerHandler.getServerInfo(data, i, function(e) {
					e.row.data = e.data;
					e.row.addEventListener('click', rowClickHandler);

					//update the existing temporary row and update it in consequence
					tableView.updateRow(e.index, e.row);
				});
			} catch(e) {
				alert("Uh oh, I think something went terribly wrong. :(\nI'm working on this issue, but for now you can restart the app.");
			}

			//next server, next row
			servers.next();
			i++;
		}
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

function rowClickHandler(e) {
	//if we click on a row, we want to edit it
	var win_add = Ti.UI.createWindow({
		url: 'server-info.js',
		title: I('addServer.titleEdit'),
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png',
		serverIDToEdit: e.rowData.data.sqlid
	});

	win_add.addEventListener('close', function(e) {
		b_done.fireEvent('click', null);
		updateList();
	});

	win_add.open({
		modal: true
	});
}

var b_add = Ti.UI.createButton({
	image: '/img/add.png',
	backgroundImage: '/img/menubar-button.png'
});

b_add.addEventListener('click', function(e) {
	//open the server creation window
	var win_add = Ti.UI.createWindow({
		url: 'server-info.js',
		title: I('addServer.title'),
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png'
	});

	win_add.addEventListener('close', function(e) {
		b_done.fireEvent('click', null);
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

var b_done = Ti.UI.createButton({
	image: '/img/check.png',
	backgroundImage: '/img/menubar-button.png'
});

var b_info = Ti.UI.createButton({
	image: '/img/info.png',
	backgroundImage: '/img/menubar-button.png'
});

b_edit.addEventListener('click', function(e) {
	tableView.setEditing(true);
	win.setLeftNavButton(b_done, {
		animated: true
	});
	win.setRightNavButton(b_add, {
		animated: true
	});
});

b_done.addEventListener('click', function(e) {
	tableView.setEditing(false);
	win.setLeftNavButton(b_edit, {
		animated: true
	});
	win.setRightNavButton(b_info, {
		animated: true
	});
});

b_info.addEventListener('click', function(e) {
	var win_info = Ti.UI.createWindow({
		url: 'credits.js',
		title: I('credits.title'),
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png'
	});

	win_info.open({
		modal: true
	});
});

win.setRightNavButton(b_info);
win.setLeftNavButton(b_edit);

var view_ad = Ti.UI.iOS.createAdView({
	adSize: Ti.UI.iOS.AD_SIZE_PORTRAIT,
	bottom: 0
});

win.add(view_ad);
updateList();
