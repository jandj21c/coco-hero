
// 봇서버로 부터 받은 요청 처리
var util      = require('../../util');

// 웹훅 방식의 응답
var responseBody = {
  version: '2.0',
  data: {
      responseMsg : '',
      responseMsgBithumb : '',
      responseMsgUpbit : '',
      responseMsgBinance : '',
      responseMsgCoinone : ''
  }
};

var ______coinPriceCommand = function(req, res) {

  console.log('----------- coinPriceCommand req --------------------');
  //console.log('----------- coinPriceCommand chat bot server request body -------------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('----------- coinPriceCommand chat bot server request end -----------');

  //var hasCode    = req.body.action.detailParams.hasOwnProperty('sysCoinCode');
  var hasName             = req.body.action.detailParams.hasOwnProperty('sysCoinName');
  var hasCoinNameContext  = req.body.action.detailParams.hasOwnProperty('coinNameContext');

  var queryCoinType;
  var coinName;

  if ( hasCoinNameContext ) {
    var coinContextObj = req.body.action.detailParams.coinNameContext;
    //console.log('사용자가 요청한 coin context name: '+coinContextObj.origin);

    queryCoinType = parseCoinCode( coinContextObj.origin );
    coinName = parseCoinName( coinContextObj.origin );
  }
  else if ( hasName ) {
    var coinNameObj = req.body.action.detailParams.sysCoinName;
    //console.log('사용자가 요청한 coin name: '+coinNameObj.origin);

    queryCoinType = parseCoinCode( coinNameObj.origin );
    coinName = parseCoinName( coinNameObj.origin );
  }
  else {
    queryCoinType = 'unknown';
  }

  //console.log('파싱된 코인 코드명 : '+queryCoinType+', 코인 이름: '+coinName);

  if( queryCoinType == 'unknown') {
    // 알수없는 코인임을 말풍선으로 알려야 한다.
    responseBody.data.responseMsg = '현재 등록되지 않은 코인 정보 입니다'
    res.status(200).json(responseBody);

    return;
  }

  if ( hasCoinNameContext ) {
    //console.log('거래소별 코인시세 결과 전송');
    responseBody.data.responseMsgBithumb = coinInfo.getBithumbPrice(queryCoinType, true);
    responseBody.data.responseMsgUpbit = coinInfo.getUpbitPrice(queryCoinType, true);
    responseBody.data.responseMsgBinance = coinInfo.getBinancebPrice(queryCoinType, true);
    // console.log(responseBody.data.responseMsgBithumb);
    // console.log(responseBody.data.responseMsgUpbit);

    res.status(200).json(responseBody);
    // bithumbApi.coinQuerybithumb(queryCoinType, coinName, function(respMsg) {
    //   responseBody.data.responseMsgBithumb = respMsg;
    //
    //   console.log('responseBody data : '+responseBody.data);
    //   res.status(200).json(responseBody);
    // });
  }
  else if ( hasName ) {
    //console.log('코인시세 결과 전송 - 빗썸');
    responseBody.data.responseMsg = coinInfo.getBithumbPrice(queryCoinType, false);
    //console.log(responseBody.data.responseMsg);
    res.status(200).json(responseBody);
    // bithumbApi.coinQuerybithumb(queryCoinType, coinName, function(respMsg) {
    //   responseBody.data.responseMsg = respMsg;
    //
    //   console.log('responseBody data : '+responseBody.data);
    //   res.status(200).json(responseBody);
    // });
  }
  else {
    res.status(200).json(responseBody);
  }
}

var parseCoinCode = function( input ){

  switch (input) {
    case 'btc':
    case 'bitcoin':
    case '비트코인':
    case '비코':
    case '비트':
      return 'btc';

    case 'xrp':
    case 'ripple':
    case '리플':
    case '리플코인':
      return 'xrp';

    case 'eth':
    case '이더리움':
    case '이더':
      return 'eth';

    case 'ltc':
    case '라코':
    case '라이트코인':
    case '라이트':
      return'ltc';

    case 'etc':
    case '이더리움클래식':
    case '이더리움 클래식':
    case '이클':
      return 'etc';

    case 'bch':
    case '비코캐':
    case '비트코인캐시':
    case '비캐':
      return 'bch';

    case 'xmr':
    case '모네로':
      return 'xmr';

    case 'qtum':
    case '퀀텀':
    case '큐텀':
      return 'qtum';

    case 'ada':
    case '에이다':
      return 'ada';

    case 'neo':
    case '네오':
      return 'neo';

    case 'eos':
    case '이오스':
      return 'eos';

    case 'trx':
    case '트론':
      return 'trx';

    case 'xlm':
    case '스텔라':
    case '스텔라루멘':
      return 'xlm';

    default:
      return 'unknown';
  }
}

var parseCoinName = function( input ){

  switch (input) {
    case 'btc':
    case 'bitcoin':
    case '비트코인':
    case '비코':
    case '비트':
      return '비트코인';

    case 'xrp':
    case 'ripple':
    case '리플':
    case '리플코인':
      return '리플';

    case 'eth':
    case '이더리움':
    case '이더':
      return '이더리움';

    case 'ltc':
    case '라이트코인':
    case '라이트':
      return'라이트코인';

    case 'etc':
    case '이더리움클래식':
    case '이더리움 클래식':
    case '이클':
      return '이더리움클래식';

    case 'bch':
    case '비코캐':
    case '비트코인캐시':
    case '비캐':
      return '비트코인캐시';

    case 'xmr':
    case '모네로':
      return '모네로';

    case 'qtum':
    case '퀀텀':
    case '큐텀':
      return '퀀텀';

    case 'ada':
    case '에이다':
      return 'ada';

    case 'neo':
    case '네오':
      return '네오';

    case 'eos':
    case '이오스':
      return '이오스';

    case 'trx':
    case '트론':
      return '트론';

    case 'xlm':
    case '스텔라':
    case '스텔라루멘':
      return '스텔라루멘';

    default:
      return 'unknown';
  }
}


module.exports.coinPriceCommand = coinPriceCommand;
module.exports.parseCoinCode = parseCoinCode;
module.exports.parseCoinName = parseCoinName;
