function tv_pull(data) {
	var isMcStyle = Ti.App.Properties.getBool('ui_mc_style', true);
	
	function formatDate() {
		var date = new Date();

		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();

		if(month < 10) {
			month = "0" + month;
		}
		if(day < 10) {
			day = "0" + day;
		}
		if(hours < 10) {
			hours = "0" + hours;
		}
		if(minutes < 10) {
			minutes = "0" + minutes;
		}

		var datestr = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
		return datestr;
	}

	var tableView = Ti.UI.createTableView(data);

	var tableHeader = Ti.UI.createView({
		backgroundColor: (isMcStyle) ? '#5c4a3c' : '#e2e7ed',
		width: 320,
		height: 80
	});

	var border = Ti.UI.createView({
		backgroundColor: (isMcStyle) ? '#4a3b30' : '#4b4b4b',
		height: 1,
		bottom: 0
	});

	tableHeader.add(border);

	var arrow = Ti.UI.createView({
		backgroundImage: (isMcStyle) ? '/img/arrow-mc.png' : '/img/arrow.png',
		width: 23,
		height: 53,
		bottom: 15,
		left: 50
	});

	tableHeader.add(arrow);

	var statusLabel = Ti.UI.createLabel({
		text: 'Pull to refresh...',
		left: 95,
		width: 200,
		bottom: 35,
		height: Ti.UI.SIZE,
		color: (isMcStyle) ? '#a69588' : '#576c89',
		textAlign: 'left',
		font: {
			fontSize: 14,
			fontWeight: 'bold'
		},
		shadowColor: (isMcStyle) ? '#6b5c50' : '#f6f8fa',
		shadowOffset: {
			x: 0,
			y: 1
		}
	});

	tableHeader.add(statusLabel);

	var lastUpdatedLabel = Ti.UI.createLabel({
		text: 'Updated: ' + formatDate(),
		left: 95,
		width: 200,
		bottom: 20,
		height: Ti.UI.SIZE,
		color: (isMcStyle) ? '#a69588' : '#576c89',
		textAlign: 'left',
		font: {
			fontSize: 13
		},
		shadowColor: (isMcStyle) ? '#6b5c50' : '#f6f8fa',
		shadowOffset: {
			x: 0,
			y: 1
		}
	});

	tableHeader.add(lastUpdatedLabel);

	var actInd = Ti.UI.createActivityIndicator({
		left: 50,
		bottom: 18,
		width: 30,
		height: 30,
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
	});

	tableHeader.add(actInd);
	tableView.headerPullView = tableHeader;

	var pulling = false;
	var reloading = false;

	function beginReloading() {
		Ti.App.fireEvent('reload', null);
		setTimeout(endReloading, 2000);
	}

	function endReloading() {
		reloading = false;

		actInd.hide();
		arrow.show();
		tableView.setContentInsets({
			top: 0
		}, {
			animated: true
		});
	}


	tableView.addEventListener('scroll', function(e) {
		var offset = e.contentOffset.y;
		if(offset <= -70.0 && !pulling && !reloading) {
			var t = Ti.UI.create2DMatrix();
			t = t.rotate(-180);
			pulling = true;
			arrow.animate({
				transform: t,
				duration: 180
			});
			statusLabel.text = "Release to refresh...";
		} else if((offset > -70.0 && offset < 0 ) && pulling && !reloading) {
			pulling = false;
			var t = Ti.UI.create2DMatrix();
			arrow.animate({
				transform: t,
				duration: 180
			});
			statusLabel.text = "Pull down to refresh...";
		}
	});

	tableView.addEventListener('dragEnd', function() {
		if(pulling && !reloading) {
			reloading = true;
			pulling = false;
			arrow.hide();
			actInd.show();
			statusLabel.setText('Reloading...');

			tableView.setContentInsets({
				top: 70
			}, {
				animated: true
			});

			tableView.scrollToTop(-70, true);
			arrow.setTransform(Ti.UI.create2DMatrix());
			beginReloading();
		}
	});

	return tableView;
};

module.exports = tv_pull;
