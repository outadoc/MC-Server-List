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
	var list = [{
		name: 'FRLBS',
		host: 'frcubes.net'
	}, {
		name: 'Outrant',
		host: 'minecraft.outrant.be'
	}, {
		name: 'Team Kigyar',
		host: 'teamkigyar.fr'
	}, {
		name: 'WTCraft',
		host: 'jouer.wtcraft.com'
	}];

	for(var i = 0; i < list.length; i++) {
		var data = {
			name: list[i].name,
			host: list[i].host,
			id: i
		};

		//create temp row
		ServerHandler.getRow(data, function(e) {
			tableView.appendRow(e.row);
		}, ServerHandler.state.POLLING);

		//get real info
		ServerHandler.getServerInfo(data, function(e) {
			e.row.data = e.data;
			tableView.updateRow(e.data.id, e.row);
		});
	}
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