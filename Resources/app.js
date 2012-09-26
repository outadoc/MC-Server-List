var db = Ti.Database.open('servers');
db.execute('CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY, name VARCHAR(16) NOT NULL, host VARCHAR(32) NOT NULL, port INTEGER DEFAULT 25565)');
db.file.setRemoteBackup(true);
db.close();

var tabgroup = Ti.UI.createTabGroup();

var win_list = Ti.UI.createWindow({
	url: 'views/list.js',
	title: 'Server List',
	barImage: 'img/menubar.png'
});

var win_more = Ti.UI.createWindow({
	url: 'views/more.js',
	title: 'More',
});

var tab1 = Ti.UI.createTab({
	window: win_list,
	title: 'Servers',
	icon: 'img/controller.png'
});

var tab2 = Ti.UI.createTab({
	window: win_more,
	title: 'Settings',
	icon: 'img/gear.png',
	backgroundColor: 'stripped'
});

tabgroup.addTab(tab1);
tabgroup.addTab(tab2);

tabgroup.open();