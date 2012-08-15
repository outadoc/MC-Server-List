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
	icon: 'img/gear.png'
});

tabgroup.addTab(tab1);
tabgroup.addTab(tab2);

tabgroup.open();
