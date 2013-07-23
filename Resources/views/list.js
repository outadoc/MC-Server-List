var win = Ti.UI.currentWindow;

var ServerHandler = require('/includes/ServerHandler');
Ti.include('/includes/lib/json.i18n.js');

var isMcStyle = Ti.App.Properties.getBool('mcStyledUI', true);
var defaultBarColor = '#806854';

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
				alert("Uh oh, I think something went terribly wrong. :(\nFor now you can refresh or try to restart the app.");
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
	if(e.rowData.data.sqlid !== undefined) {
		var db = Ti.Database.open('servers');
		db.execute('DELETE FROM servers WHERE id=?', e.rowData.data.sqlid);
		db.close();
	}
});

function rowClickHandler(e) {
	//if we click on a row, we want to edit it
	var win_add = Ti.UI.createWindow({
		url: 'server-info.js',
		title: I('addServer.titleEdit'),
		barColor: defaultBarColor,
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png',
		serverIDToEdit: e.rowData.data.sqlid
	});

	win_add.addEventListener('close', function(e) {
		updateList();
	});

	win_add.open({
		modal: true
	});
}

var b_add = Ti.UI.createButton({
	systemButton: Ti.UI.iPhone.SystemButton.ADD
});

b_add.addEventListener('click', function(e) {
	//open the server creation window
	var win_add = Ti.UI.createWindow({
		url: 'server-info.js',
		title: I('addServer.title'),
		barColor: defaultBarColor,
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

var b_info = Ti.UI.createButton({
	style: Ti.UI.iPhone.SystemButton.INFO_LIGHT,
	left: 10
});

var view_info = Ti.UI.createView();
view_info.add(b_info);

b_info.addEventListener('click', function(e) {
	var win_info = Ti.UI.createWindow({
		url: 'credits.js',
		title: I('credits.title'),
		barColor: defaultBarColor,
		barImage: '/img/menubar.png',
		backgroundImage: '/img/full-bg.png'
	});

	win_info.open({
		modal: true,
		modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL
	});
});

win.setRightNavButton(b_add);
win.setLeftNavButton(view_info);

var adView = Ti.UI.iOS.createAdView({
	adSize: Ti.UI.iOS.AD_SIZE_PORTRAIT,
	height: Ti.UI.SIZE,
	width: Ti.UI.FILL,
	bottom: 0,
	backgroundColor: 'transparent'
});

adView.addEventListener('load', function(e) {
	if(tableView != null) {
		tableView.animate({
			bottom: 50,
			duration: 200
		});
	}
});

adView.addEventListener('error', function(e) {
	if(tableView != null) {
		tableView.animate({
			bottom: 0,
			duration: 200
		});
	}
});

win.add(adView);
updateList();
