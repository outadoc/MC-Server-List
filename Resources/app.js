(function() {
	var db = Ti.Database.open('servers');
	db.execute('CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY, name VARCHAR(16) NOT NULL, host VARCHAR(32) NOT NULL, port INTEGER DEFAULT 25565)');
	db.file.setRemoteBackup(true);
	db.close();

	Ti.include('/includes/lib/json.i18n.js');
	
	Titanium.UI.setBackgroundColor('#1F150D');
	
	var tabgroup = Ti.UI.createTabGroup(),
		Utils = require('/includes/Utils'),
	
	win_list = Ti.UI.createWindow({
		url: 'views/list.js',
		title: I('main.title'),
		barColor: Utils.getNavBarColor(),
		backgroundColor: Utils.getBackgroundColor(),
		navTintColor: Utils.getTintColor(),
		tabBarHidden: true,
		backgroundColor: 'white',
		translucent: false,
		statusBarStyle: (Utils.getMajorOsVersion() < 7) ? Ti.UI.iPhone.StatusBar.DEFAULT : undefined
	});

	tabgroup.addTab(Ti.UI.createTab({
		window: win_list
	}));
	
	tabgroup.open();
	
})();
