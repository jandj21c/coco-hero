// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Logger
var logger = require('morgan');

// 모듈로 분리한 설정 파일 불러오기
var config = require('./config');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

// 거래소 폴링 시작
var polling_coin_price = require('./routes/market/price');
//var notify = require('./AlimCenter/priceNotifier');

//var sequelize = require('./models').sequelize;

//===== 서버 변수 설정 =====//
let portNum = config.server_port;

// 익스프레스 객체 생성
var app = express();
//sequelize.sync(); // 데이터베이스 동기화

app.use(logger('dev', {}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

route_loader.init(app, express.Router());
polling_coin_price.init();
//notify.eventReadyPriceNotify();

// unexpected error handlder
var errorHandler = expressErrorHandler({
    static: {
        '404': './error.html'
    }
})

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

app.all('*', function(req, res){
  res.status(404).send('<h1>ERROR - Not Found this URL. by Giparang.</h1>');
});

app.listen(portNum, function() {
  console.log('============= 기파랑의 리플 챗봇 서버가 시작되었습니다 ============');
  console.log(`=============      Server is up on port ${portNum}.    ============`);
});