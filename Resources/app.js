(function() {
	var db = Ti.Database.open('servers');
	db.execute('CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY, name VARCHAR(16) NOT NULL, host VARCHAR(32) NOT NULL, port INTEGER DEFAULT 25565)');
	db.file.setRemoteBackup(true);
	db.close();
	
	Ti.include('/includes/lib/json.i18n.js');

	var tabgroup = Ti.UI.createTabGroup();

	var win_list = Ti.UI.createWindow({
		url: 'views/list.js',
		title: 'Server List',
		barImage: 'img/menubar.png',
		tabBarHidden: true
	});

	var tab1 = Ti.UI.createTab({
		window: win_list
	});

	tabgroup.addTab(tab1);
	tabgroup.open();
})();
