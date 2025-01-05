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

var exchange = require('./routes/market/wsPrice');
var breakingNews = require('./news/coinNews');
var algoran_youtube = require('./news/youtube');
var db = require('./db/mongoTest');


//var notify = require('./AlimCenter/priceNotifier');

//===== 서버 변수 설정 =====//
let portNum = config.server_port;

// 익스프레스 객체 생성
var app = express();
//sequelize.sync(); // 데이터베이스 동기화

app.use(logger('dev', {}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

route_loader.init(app, express.Router());

// 거래소 정보 폴링
exchange.initExchangeData();

// 속보 크롤링
//breakingNews.startMonitorBreackingNews();

// 알고란 유튜브 새로운 영상 확인
algoran_youtube.startVideoCheckScheduler();

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
  console.log('============= 기파랑의 챗봇 서버가 시작되었습니다 ============');
  console.log(`사용중인 Port : ${portNum}`);
});