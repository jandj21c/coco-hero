var util = require('../../util');
var cmcAPI = require('../../exchange/coinmarketcap');
const textToImage = require('text-to-image');
const path = require('path');

//var majorExchangeArray = ["bithumb","upbit","binance","coinone"];
//var majorCoinArray = ["btc","eth","xrp","ltc","etc","bch","xmr","qtum","ada","neo","eos","trx","xlm"];

//var exchangeList = [];

// var bithumb = {};
// var upbit = {};
// var binance = {};

var exchange_cmc = [];
var fileNameCount = 0;
var exchange_cmc = [];

function coinPriceSpec(id) {

  this.id = id;
	this.name = 'undefined';
  this.symbol = 'undefined';
	this.currentPrice = '0';
	this.fluctate_rate_24 = '0';
	this.volume_24 = '0'
};

var responseBody = {

  version: '2.0',
  data: {
      responseMsg : '',
    }
};

var polling_coin_price = {};

polling_coin_price.init = function() {

	console.log('init. polling coin price 시작.');

	initExchange();
	initPolling();

};

function initExchange() {
    exchange_cmc = [];
}

function initPolling() {

	console.log('거래소 코인 시세 폴링 시작');
  getCoinPriceInterval();
	setInterval(getCoinPriceInterval, 300000);
}

// CMC 코인 가격 폴링
function getCoinPriceInterval() {

  console.log('======== Get CMC Market Listings Price =========');

  cmcAPI.queryCMCPrice(function (resp) {
        if( resp == null )
            return;

        var respJson = JSON.parse(resp);

        if (respJson.status.error_code != 0)
        {
            console.log(respJson.status);
            return;
        }

        parseCMCToGeneral(respJson.data);

        console.log(`코인마켓캡 거래소 /listings/latest 데이터 개수 ${exchange_cmc.length}`);
    });
}

// 코인리스트 나열시 말풍선
function parseCMCToGeneral(respDATA) {

  exchange_cmc = [];

  respDATA.forEach((data)=>{

      var coin = new coinPriceSpec(data["id"]);
      coin.name = data["name"].toLowerCase();
      coin.symbol = data["symbol"].toLowerCase();
      coin.currentPrice = data.quote.USD["price"]; //현재가
      coin.fluctate_rate_24 = data.quote.USD["percent_change_24h"];
      coin.volume_24 = data.quote.USD["volume_24h"];

      //console.log(`CMC Listing Data : ${coin.name}`);

      exchange_cmc.push(coin);
  });
}

var coinPriceCommand = function(req, res) {

  console.log('----------- coinPriceCommand req --------------------');
  //console.log('----------- coinPriceCommand chat bot server request body -------------');
  console.log(JSON.stringify(req.body, null, 4));
  //console.log('----------- coinPriceCommand chat bot server request end -----------');

  //var hasCode    = req.body.action.detailParams.hasOwnProperty('sysCoinCode');
  //var hasName             = req.body.action.detailParams.hasOwnProperty('sysCoinName');
  //var hasCoinNameContext  = req.body.action.detailParams.hasOwnProperty('coinNameContext');

  var hasUtterance  = req.body.userRequest.hasOwnProperty('utterance');

  var coinData;
  var userWantCoin;

  if ( hasUtterance ) {
    var utter = req.body.userRequest.utterance; 
    console.log(JSON.stringify(`사용자가 요청한  가격 블록의 대화전문: ${utter}`));

    // 사용자 대화는 "!가격 XXX" 라고 들어왔을거라 가정하고 !가격 뒤를 자름
    userWantCoin = utter.substr(3).trim();
    console.log(JSON.stringify(`사용자가 요청한  코인 가격 정보 : ${userWantCoin}`));
  }

  if( util.isEmpty(userWantCoin) == false) {
    coinData = parseCoin_Name_Or_Symbol(userWantCoin);
  }

  if( util.isEmpty(coinData) ) {

    // 알수없는 코인임을 말풍선으로 알려야 한다.
    responseBody.data.responseMsg = '현재 등록되지 않은 코인 정보 입니다'
    res.status(200).json(responseBody);
  }
  else {
    console.log('CMC 거래소 가격');

    console.log('2222');
    var fileName = 'debug_file_'+fileNameCount.toString()+'.png'; 
    //const fileName = 'debug_file_'+`${fileNameCount}`+'.png';

    console.log(fileName);
    console.log('3333');
    const dataUri = parseImageResponseMsg(coinData, fileName);

    responseBody.data.responseMsg = parseGeneralResponseMsg(coinData);
    //console.log(responseBody.data.responseMsg);

    res.status(200).json(responseBody);
    //deleteImageFile(fileName);
  }
  return;
}

var deleteImageFile = function(fileName) {
  try {

    //동기 방식으로 파일 삭제
      fs.unlinkSync(`./priceImage/${fileName}`)
  
  } catch (error) {
  
      if(err.code == 'ENOENT'){
          console.log("파일 삭제 Error 발생");
      }
  }
}

var parseCoin_Name_Or_Symbol = function( input ) {

  let coinData = exchange_cmc.find( (element) =>
    {
      return (element.name === input || element.symbol === input)
    });

  return coinData;
}

async function parseImageResponseMsg(coinData, fileName) {

  // 배경 
  // HEX : 35bcd5, 
  // rgb(53, 188, 213)
  // hsl(189, 66%, 52%)
  var openPrice = Math.round(coinData.currentPrice * 100) /100; // 소수점 두자리 반올림
  if( openPrice > 0 ) {
    openPrice = util.nameWithCommas(openPrice);
  }
  openPrice = openPrice+'달러';

  const upperCoinName = coinData.name.toUpperCase();

  var fluctateRate = Math.round(coinData.fluctate_rate_24 * 100) /100; // 소수점 두자리 반올림
  if( fluctateRate > 0){
    fluctateRate = '🔺+' +fluctateRate;
  }
	else {
		fluctateRate = '💧' +fluctateRate;
	}

  var volume_24 = coinData.volume_24;

    var responseMsg = `${upperCoinName} 거래소 가격
\n가격: ${openPrice}
\n변동율: ${fluctateRate}% `;

    // using the asynchronous API with await
    return await textToImage.generate(responseMsg, {
      debug: true,
      debugFilename: path.join('priceImage', fileName),
      margin: 5,
      fontSize: 23,
      fontFamily:'sans-serif',
      maxWidth: 250,
      bgColor: '#35bcd5',
      textColor: 'white',
      textAlign:'center',
      verticalAlign: 'center'
    });

    // using the asynchronous API with .then
    // textToImage.generate('Lorem ipsum dolor sit amet').then(function (dataUri) {
    //   // use the dataUri
    // });

    // using the synchronous API
    //const dataUri = textToImage.generateSync('Lorem ipsum dolor sit amet');
}

function parseGeneralResponseMsg(coinData) {

	//console.log(coinData);
 
	var openPrice = coinData.currentPrice;
  if( openPrice > 0 ) {
    openPrice = util.nameWithCommas(openPrice);
  }
  openPrice = openPrice+'달러';

  var fluctateRate = Math.round(coinData.fluctate_rate_24 * 100) /100; // 소수점 두자리 반올림
  if( fluctateRate > 0){
    fluctateRate = '🔺+' +fluctateRate;
  }
	else {
		fluctateRate = '💧' +fluctateRate;
	}

  //var maxPrice = util.nameWithCommas(coinInfo["maxPrice"]);
  //var minPrice = util.nameWithCommas(coinInfo["minPrice"]);

  var volume_24 = coinData.volume_24;
  //바이낸스 때문에 볼륨은 불규칙하게 보여준다.
	//   var volume_24 = Number(coinInfo["volume_24"]);
	//   volume_24 = util.nameWithCommas(Math.floor(volume_24));  // 소수점 버림
  const upperCoinName = coinData.name.toUpperCase();

  var responseMsg = ` ${upperCoinName} 의 현재 코인마켓캡 가격은
 ${openPrice} (${fluctateRate}%) 입니다.

 심볼 : ${coinData.symbol}
 거래량 : ${volume_24}`;

  return responseMsg;
}


function parseCarouselResponseMsg(coinInfo) {

	//console.log(coinInfo);
 var coinName = coinInfo["coinName"];
	var openPrice = coinInfo["currentPrice"];
  if( openPrice > 0 ) {
    openPrice = util.nameWithCommas(openPrice);
  }
  openPrice = openPrice+'원';

  var fluctate = coinInfo["fluctate_24"];
  if( fluctate > 0){
    fluctate = util.nameWithCommas(fluctate);
    fluctate ='🔺+' +fluctate;
  }
  else {
    fluctate = util.nameWithCommas(fluctate);
    fluctate ='💧' +fluctate;
  }
  fluctate = fluctate+'원';

  var fluctateRate = coinInfo["fluctate_rate_24"];
  if( fluctateRate > 0){
    fluctateRate = '🔺+' +fluctateRate;
  }
	else {
		fluctateRate = '💧' +fluctateRate;
	}

  var maxPrice = util.nameWithCommas(coinInfo["maxPrice"]);
  var minPrice = util.nameWithCommas(coinInfo["minPrice"]);

  var volume_24 = coinInfo["volume_24"];
//   var volume_24 = Number(coinInfo["volume_24"]);
//   volume_24 = util.nameWithCommas(Math.floor(volume_24));  // 소수점 버림

  var responseMsg = `✔ ${openPrice} (${fluctateRate}%)
✔ 거래량 : ${volume_24}`;

  return responseMsg;
}

var getBithumbPrice = function(coinName, forCarousel) {

	let coinInfo = exchangeList['bithumb'].coinList[coinName];
	if(forCarousel) {
		return parseCarouselResponseMsg(coinInfo);
	}
	else{
		return parseGeneralResponseMsg(coinInfo);
	}
	
};

var getUpbitPrice = function(coinName, forCarousel) {

	let coinInfo = exchangeList['upbit'].coinList[coinName];
	if(forCarousel) {
		return parseCarouselResponseMsg(coinInfo);
	}
	else{
		return parseGeneralResponseMsg(coinInfo);
	}

};

var getBinancebPrice = function(coinName, forCarousel) {

	let coinInfo = exchangeList['binance'].coinList[coinName];
	if(forCarousel) {
		return parseCarouselResponseMsg(coinInfo);
	}
	else{
		return parseGeneralResponseMsg(coinInfo);
	}
	
};

// var getCoinonePrice = function(coinName) {
// 	return parseGeneralResponseMsg(exchangeList['coinone'].coinList[coinName]);
// };



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


module.exports 						= polling_coin_price;
module.exports.coinPriceCommand = coinPriceCommand;