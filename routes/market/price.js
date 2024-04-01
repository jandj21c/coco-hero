var util = require('./util');

var cmc		= require('../../exchange/coinmarketcap');

//var majorExchangeArray = ["bithumb","upbit","binance","coinone"];
//var majorCoinArray = ["btc","eth","xrp","ltc","etc","bch","xmr","qtum","ada","neo","eos","trx","xlm"];

//var exchangeList = [];

// var bithumb = {};
// var upbit = {};
// var binance = {};
var exchange_cmc = {}

//const quoteUSD = 1137;

var coinPriceSpec = function COIN_PRICE_SPEC(name) {
    this.id = 0;
	this.name = name;
	this.currentPrice = '0';
	this.fluctate_rate_24 = '0';
	this.volume_24 = '0';
};

var polling_coin_price = {};

polling_coin_price.init = function() {

	console.log('init. polling coin price 시작.');

	initExchange();
	initPolling();

};

function initExchange() {
    this.exchange_cmc = new Array();
}

function initPolling() {

	console.log('거래소 코인 시세 폴링 시작');
	setInterval(getCoinPriceInterval, 15000);
}

function getCoinPriceInterval() {

    cmc.queryCMCPrice(function (resp) {
        if( resp == null )
            return;

        var respJson = JSON.parse(resp);

        if (respJson.status.error_code != 0)
        {
            console.log(respJson.status);
            return;
        }

        parseCMCToGeneral(respJson.data);
    });
}


function parseGeneralResponseMsg(coinInfo) {

	//console.log(coinInfo);
 var coinName = coinInfo;
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
  //바이낸스 때문에 볼륨은 불규칙하게 보여준다.
	//   var volume_24 = Number(coinInfo["volume_24"]);
	//   volume_24 = util.nameWithCommas(Math.floor(volume_24));  // 소수점 버림
  const upperCoinName = coinName.toUpperCase();

  var responseMsg = ` ${upperCoinName} 의 현재 가격(빗썸기준)은
 ${openPrice} (${fluctateRate}%) 입니다.

 변동가 : ${fluctate}
 최저가 : ${minPrice}
 최고가 : ${maxPrice}
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


// 코인리스트 나열시 말풍선
function parseCMCToGeneral(respDATA) {
    respDATA.forEach((data)=>{

        var coin = new coinPriceSpec;
        
        coin.name = data["name"];
        coin.id = data["id"];
        coin.currentPrice = data.quote.USD["price"]; //현재가
        coin.fluctate_rate_24 = data.quote.USD["percent_change_24h"];
        coin.volume_24 = data.quote.USD["volume_24h"];

        this.exchange_cmc.push(coin);
    });
	
}


module.exports 						= polling_coin_price;
module.exports.majorCoinArray		= majorCoinArray;
module.exports.exchangeList 		= exchangeList;
module.exports.getBithumbPrice 		= getBithumbPrice;
module.exports.getUpbitPrice 		= getUpbitPrice;
module.exports.getBinancebPrice 	= getBinancebPrice;