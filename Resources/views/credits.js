var win = Ti.UI.currentWindow;
Ti.include('/includes/lib/json.i18n.js');

var b_close = Ti.UI.createButton({
	title: I('buttons.close'),
	style: Ti.UI.iPhone.SystemButtonStyle.DONE
});

b_close.addEventListener('click', function(e) {
	win.container.close();
});

win.setLeftNavButton(b_close);

var scrollView = Ti.UI.createScrollView({
	height: Ti.UI.FILL,
	width: Ti.UI.FILL,
	layout: 'vertical',
	contentHeight: 'auto'
});

win.add(scrollView);

var img_logo = Ti.UI.createImageView({
	image: '/img/icon-large.png',
	top: 10,
	width: 130
});

scrollView.add(img_logo);

var lbl_app = Ti.UI.createLabel({
	text: Ti.App.getName() + ' v' + Ti.App.getVersion(),
	top: 0,
	color: '#000000',
	font: {
		fontSize: 20,
		fontWeight: 'bold'
	}
});

scrollView.add(lbl_app);

var lbl_credits = Ti.UI.createLabel({
	text: I('credits.developer') + ' Baptiste Candellier (outadoc) for outa[dev]\n\n' + I('credits.platform') + ' Appcelerator Titanium\n\n',
	font: {
		fontSize: 16
	},
	color: '#000000',
	width: 280,
	top: 15,
	height: Ti.UI.SIZE,
	textAlign: 'center'
});

scrollView.add(lbl_credits);

var img_outadev = Ti.UI.createImageView({
	image: '/img/outadev.png',
	top: 20,
	bottom: 20,
	height: Ti.UI.SIZE
});

img_outadev.addEventListener('click', function(e) {
	Ti.Platform.openURL('http://dev.outadoc.fr');
});

scrollView.add(img_outadev);
