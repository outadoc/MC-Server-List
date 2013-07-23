(function() {
	var db = Ti.Database.open('servers');
	db.execute('CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY, name VARCHAR(16) NOT NULL, host VARCHAR(32) NOT NULL, port INTEGER DEFAULT 25565)');
	db.file.setRemoteBackup(true);
	db.close();

	Ti.include('/includes/lib/json.i18n.js');
	
	Titanium.UI.setBackgroundColor('#1F150D');
	
	var tabgroup = Ti.UI.createTabGroup();

	var win_list = Ti.UI.createWindow({
		url: 'views/list.js',
		title: I('main.title'),
		barColor: '#806854',
		barImage: 'img/menubar.png',
		tabBarHidden: true,
		backgroundColor: 'white'
	});

	if(Ti.App.Properties.getBool('mcStyledUI', true)) {
		win_list.setBackgroundImage('/img/full-bg.png');
	}

	var tab1 = Ti.UI.createTab({
		window: win_list
	});

	tabgroup.addTab(tab1);
	tabgroup.open();
})();
