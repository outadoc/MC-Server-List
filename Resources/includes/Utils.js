(function() {
	
	exports.getMajorOsVersion = function() {
		var version = Titanium.Platform.version.split(".");
		return parseInt(version[0]);
	};
	
	exports.getNavBarColor = function() {
		return '#877261';
	};
	
	exports.getTintColor = function() {
		return '#FFFFFF';
	};
	
})();
