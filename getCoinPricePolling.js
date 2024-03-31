var util = require('./util');
var bithumbApi	= require('./exchange/bithumbApi');
var upbitApi	= require('./exchange/upbitApi');
var binanceApi		= require('./exchange/binance');

var majorExchangeArray = ["bithumb","upbit","binance","coinone"];
var majorCoinArray = ["btc","eth","xrp","ltc","etc","bch","xmr","qtum","ada","neo","eos","trx","xlm"];

var exchangeList = [];

var bithumb = {};
var upbit = {};
var binance = {};
var coinone = {};

const quoteUSD = 1137;

var coinPriceSpec = function COIN_PRICE_SPEC(name) {
	this.coinName = name;
	this.currentPrice = '0';
	this.fluctate_24 = '0';
	this.fluctate_rate_24 = '0';
	this.minPrice = '0';
	this.maxPrice = '0';
	this.volume_24 = '0';
};

function EXCHANGE(name) {
	this.exchange_name = name;
  this.coinList = [];

	for(var i = 0; i < majorCoinArray.length ; i++)
	{
		 var coin = majorCoinArray[i];
		 this.coinList[coin] = new coinPriceSpec;

		 //console.log(this.coinList);
	}
}



var polling_coin_price = {};

polling_coin_price.init = function() {

	console.log('init. polling coin price 시작.');

	initExchange();
	initPolling();

};

function initExchange() {

	exchangeList['bithumb'] = new EXCHANGE;
	exchangeList['upbit'] = new EXCHANGE;
	exchangeList['binance'] = new EXCHANGE;
	// for(var i = 0; i < majorExchangeArray.length ; i++)
	// {
	// 	 var exchangeName = majorExchangeArray[i];
	// 	 console.log('exchangeName : '+exchangeName);
	//
	// 	 exchangeList[exchangeName] = new exchange;
	// }
	// bithumb = new EXCHANGE('bithumb');
	// upbit   = new EXCHANGE('upbit');
	// binance = new EXCHANGE('binance');
	// coinone = new EXCHANGE('coinone');
	//console.log(exchangeList);
}

function initPolling() {

	console.log('거래소 코인 시세 폴링 시작');
	setInterval(getCoinPriceInterval, 15000);
}

function getCoinPriceInterval() {

	//console.log('polling - on time');
 	// 빗썸 거래소의 모든 코인 정보를 가져온다
	for(var i = 0 ; i < majorCoinArray.length ; i++ ) {
		var coinName = majorCoinArray[i];
		bithumbApi.queryCoinPrice(coinName, function (coinName, resp) {

			if( resp == null )
				return;

			var respJson = JSON.parse(resp);

			// 정의한 coin spec 클래스에 넣는다.
			parseBithumbToGeneral(coinName, respJson);

			// 로그 확인
			//console.log(bithumb.coinList);
		});
	}

	for (var i = 0 ; i < majorCoinArray.length ; i++) {
		var coinName = majorCoinArray[i];
		upbitApi.queryCoinPrice(coinName, function (coinName, resp) {

			if (resp == null)
				return;

			var respJson = JSON.parse(resp);

			// 정의한 coin spec 클래스에 넣는다.
			parseUpbitToGeneral(coinName, respJson);

			// 로그 확인
			//console.log(bithumb.coinList);
		});
	}

	for (var i = 0 ; i < majorCoinArray.length ; i++) {
		var coinName = majorCoinArray[i];
		binanceApi.queryCoinPrice(coinName, function (coinName, resp) {

			if (resp == null)
				return;

			var respJson = JSON.parse(resp);

			// 정의한 coin spec 클래스에 넣는다.
			parseBinanceToGeneral(coinName, respJson);

			// 로그 확인
			//console.log(bithumb.coinList);
		});
	}


	


}
// getCoinPriceInterval() {
// 	fetch(`http://localhost:4001/api/roomlist/${this.state.paramsGameNumber}`, {
// 		method: 'get',
// 		headers: {
// 			'Accept': 'application/json, text/plain, */*',
// 			'Content-Type': 'application/json',
// 			'token': JSON.parse(localStorage.getItem("token"))
// 		}
// 	}).then((response) => response.json())
//       .then((responseDate) => {
//       	this.setState({rows: responseDate});
//       }).catch((err) => {
//       	console.log(err);
//       });
// }

// 코인리스트 나열시 말풍선
function parseBithumbToGeneral(coinType, respBithumb) {

	var coin = exchangeList['bithumb'].coinList[coinType];
	coin.coinName = coinType;
	coin.currentPrice = respBithumb.data["closing_price"]; //현재가
	coin.fluctate_24 = respBithumb.data["fluctate_24H"];
	coin.fluctate_rate_24 = respBithumb.data["fluctate_rate_24H"];
	coin.minPrice = respBithumb.data["min_price"];
	coin.maxPrice = respBithumb.data["max_price"];
	let xrpTraded = respBithumb.data["units_traded"]; // xrp개수거래량

	var won_volume_24 = Math.floor(xrpTraded * coin.currentPrice); // 소수점 버림
	coin.volume_24 = String(util.nameWithCommas(won_volume_24)) + "원";  
}


function parseUpbitToGeneral(coinType, respUpbit) {
	var coin = exchangeList['upbit'].coinList[coinType];

	var strChange = '';
	var change = respUpbit[0].change;

	if (change == 'EVEN') {
	}
	else if (change == 'RISE') {
	}
	else if (change == 'FALL') {
		strChange = '-';
	}
	else {
		strChange = '?';
	}


	


	coin.coinName = coinType;
	coin.currentPrice = respUpbit[0].trade_price;
	coin.fluctate_24 = strChange + respUpbit[0].change_price;

	var fluc_24_rate = respUpbit[0].change_rate * 100;
	
	coin.fluctate_rate_24 = strChange + fluc_24_rate.toFixed(2);
	coin.minPrice = respUpbit[0].low_price;
	coin.maxPrice = respUpbit[0].high_price;

	var won_volume_24 = Number(respUpbit[0].acc_trade_price_24h);
	coin.volume_24 = String(util.nameWithCommas(Math.floor(won_volume_24))) + "원";   // 소수점 버림

}


function parseBinanceToGeneral(coinType, respBinance) {

	//{
	//  "symbol": "BNBBTC",
	//  "priceChange": "-94.99999800",
	//  "priceChangePercent": "-95.960",
	//  "weightedAvgPrice": "0.29628482",
	//  "prevClosePrice": "0.10002000",
	//  "lastPrice": "4.00000200",
	//  "lastQty": "200.00000000",
	//  "bidPrice": "4.00000000",
	//  "askPrice": "4.00000200",
	//  "openPrice": "99.00000000",
	//  "highPrice": "100.00000000",
	//  "lowPrice": "0.10000000",
	//  "volume": "8913.30000000",
	//  "quoteVolume": "15.30000000",
	//  "openTime": 1499783499040,
	//  "closeTime": 1499869899040,
	//  "firstId": 28385,   // First tradeId
	//  "lastId": 28460,    // Last tradeId
	//  "count": 76         // Trade count
	//}

	var coin = exchangeList['binance'].coinList[coinType];
	coin.coinName = coinType;
	coin.currentPrice = Math.floor(Number(respBinance.lastPrice) * quoteUSD); //usd
	coin.fluctate_24 = Math.floor(Number(respBinance.priceChange) * quoteUSD);
	coin.fluctate_rate_24 = respBinance.priceChangePercent;
	coin.minPrice = respBinance.lowPrice;
	coin.maxPrice = respBinance.highPrice;

	// let xrpTraded = respBinance.volume; //USDT와 거래한 xrp 개수
	// var won_volume_24 = Math.floor(xrpTraded * coin.currentPrice * quoteUSD); // 환율적용
	coin.volume_24 = "미수집";
}


function parseGeneralResponseMsg(coinInfo) {

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

module.exports 						= polling_coin_price;
module.exports.majorCoinArray		= majorCoinArray;
module.exports.exchangeList 		= exchangeList;
module.exports.getBithumbPrice 		= getBithumbPrice;
module.exports.getUpbitPrice 		= getUpbitPrice;
module.exports.getBinancebPrice 	= getBinancebPrice;