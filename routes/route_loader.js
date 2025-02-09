var route_loader = {};

var config = require('../config');

route_loader.init = function(app, router) {
	console.log('============= Router 초기화 =============');
	return initRoutes(app, router);
}

// route_info에 정의된 라우팅 정보 처리
function initRoutes(app, router) {

	var infoLen = config.route_info.length;
	//console.log('설정에 정의된 라우팅 모듈의 수 : %d', infoLen);

	for (var i = 0; i < infoLen; i++) {
		var curItem = config.route_info[i];

		// 모듈 파일에서 모듈 불러옴
		var curModule = require(curItem.file);
		//  라우팅 처리
		if (curItem.type == 'get') {
            router.route(curItem.path).get(curModule[curItem.method]);
		} else if (curItem.type == 'post') {
            router.route(curItem.path).post(curModule[curItem.method]);
		} else {
			router.route(curItem.path).post(curModule[curItem.method]);
		}
	}

    // 라우터 객체 등록
    app.use('/', router);
}

module.exports = route_loader;