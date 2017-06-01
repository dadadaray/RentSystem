window.onload = function() {
	map.plugin(["AMap.ToolBar"], function() {
		map.addControl(new AMap.ToolBar());
	});
	if(location.href.indexOf('&guide=1')!==-1){
		map.setStatus({scrollWheel:false})
	}
}
