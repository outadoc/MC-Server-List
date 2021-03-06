var win = Ti.UI.currentWindow;

Ti.include('/includes/lib/json.i18n.js');

var ServerHandler = require('/includes/ServerHandler'),
	Utils = require('/includes/Utils'),
		
tableView = require('/includes/PullToRefresh')({
	style: Ti.UI.iPhone.TableViewStyle.PLAIN,
	scrollIndicatorStyle: Ti.UI.iPhone.ScrollIndicatorStyle.WHITE,
	editable: true,
	separatorColor: '#4b4b4b',
	backgroundColor: Utils.getBackgroundColor()
});

win.add(tableView);

function updateList() {
	//opening the database containing the servers that we will display
	var db = Ti.Database.open('servers'),
		servers = db.execute('SELECT * FROM servers'), 
		i = 0; //this index corresponds to the tableviewrow id
		
	//erase the existing tableview entries
	tableView.setData([]);

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
					e.row.data = e.data;
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
	if(e.rowData.data != null) {
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
		barColor: Utils.getNavBarColor(),
		tintColor: Utils.getTintColor(),
		backgroundColor: Utils.getBackgroundColor(),
		serverIDToEdit: e.rowData.data.sqlid,
		translucent: false
	});

	container = Ti.UI.createWindow({
		navBarHidden: true
	}),
	
	navGroup = Ti.UI.iPhone.createNavigationGroup({
		window: win_add,
		tintColor: Utils.getTintColor()
	});

	container.add(navGroup);
	
	container.addEventListener('close', function() {	
		container = null;
		navGroup = null;
		win_add = null;
		
		updateList();
	});

	win_add.container = container;

	container.open({
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
		barColor: Utils.getNavBarColor(),
		navTintColor: Utils.getTintColor(),
		backgroundColor: Utils.getBackgroundColor(),
		translucent: false
	});

	container = Ti.UI.createWindow({
		navBarHidden: true
	}),
	
	navGroup = Ti.UI.iPhone.createNavigationGroup({
		window: win_add,
		tintColor: Utils.getTintColor()
	});

	container.add(navGroup);
	
	container.addEventListener('close', function() {		
		container = null;
		navGroup = null;
		win_add = null;
		
		updateList();
	});

	win_add.container = container;

	container.open({
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
		barColor: Utils.getNavBarColor(),
		backgroundColor: Utils.getBackgroundColor(),
		translucent: false
	});

	container = Ti.UI.createWindow({
		navBarHidden: true
	}),
	
	navGroup = Ti.UI.iPhone.createNavigationGroup({
		window: win_info,
		tintColor: Utils.getTintColor()
	});

	container.add(navGroup);
	
	container.addEventListener('close', function() {			
		container = null;
		navGroup = null;
		win_info = null;
	});

	win_info.container = container;

	container.open({
		modal: true
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
