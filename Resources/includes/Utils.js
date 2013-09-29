(function() {
	
	exports.getMajorOsVersion = function() {
		var version = Titanium.Platform.version.split(".");
		return parseInt(version[0]);
	};
	
	exports.getNavBarColor = function() {
		return '#705036';
	};
	
	exports.getTintColor = function() {
		return '#FFFFFF';
	};
	
	exports.getBackgroundColor = function() {
		return '#ffffff';
	};
	
})();
