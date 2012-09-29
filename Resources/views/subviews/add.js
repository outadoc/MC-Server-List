var win = Ti.UI.currentWindow;

var b_close = Ti.UI.createButton({
	//title: 'Close',
	backgroundImage: '/img/menubar-button.png',
	image: '/img/back.png'
});

b_close.addEventListener('click', function(e) {
	win.close();
});

win.setLeftNavButton(b_close);
