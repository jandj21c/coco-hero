var util = require('../../util');
var cmcAPI = require('../../exchange/coinmarketcap');

//var majorExchangeArray = ["bithumb","upbit","binance","coinone"];
//var majorCoinArray = ["btc","eth","xrp","ltc","etc","bch","xmr","qtum","ada","neo","eos","trx","xlm"];

//var exchangeList = [];

// var bithumb = {};
// var upbit = {};
// var binance = {};
var exchange_cmc = [];

//const quoteUSD = 1137;

var coinPriceSpec = {

  id : 0,
	name : 'undefined',
  symbol : 'undefined',
	currentPrice : '0',
	fluctate_rate_24 : '0',
	volume_24 : '0'

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
    this.exchange_cmc = [];
}

function initPolling() {

	console.log('거래소 코인 시세 폴링 시작');
  getCoinPriceInterval();

	//setInterval(getCoinPriceInterval, 120000);
}

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

        console.log(`코인마켓캡 거래소 /listings/latest 데이터 개수 ${this.exchange_cmc.length}`);
    });
}

var coinPriceCommand = function(req, res) {

  console.log('----------- coinPriceCommand req --------------------');
  //console.log('----------- coinPriceCommand chat bot server request body -------------');
  console.log(JSON.stringify(req.body, null, 4));

  //var hasCode    = req.body.action.detailParams.hasOwnProperty('sysCoinCode');
  //var hasName             = req.body.action.detailParams.hasOwnProperty('sysCoinName');
  //var hasCoinNameContext  = req.body.action.detailParams.hasOwnProperty('coinNameContext');

  //var hasUtterance  = req.body.userRequest.hasOwnProperty('utterance');

  if (req.body.userRequest.utterance === undefined){
    console.log("no utterance");
    return;
  }

  var coinData;
  var userWantCoin;

  console.log('----------- coinPriceCommand 111 --------------------');

  {
    var utter = req.body.userRequest.utterance; 
    console.log(`사용자가 요청한  가격 블록의 대화전문: ${utter}`);

    // 사용자 대화는 "!가격 XXX" 라고 들어왔을거라 가정하고 !가격 뒤를 자름
    userWantCoin = utter.substr(3).trim();
    console.log(`사용자가 요청한  코인 가격 정보 : ${userWantCoin}`);
  }

  console.log('----------- coinPriceCommand 222 --------------------');
  if( util.isEmpty(userWantCoin) == false) {

    console.log('userWantCoin not empty');
    coinData = parseCoin_Name_Or_Symbol(userWantCoin);
    console.log(`matched CMC coin ${coinData.name}, ${coinData.symbol}`)
  }

  console.log('next step');

  if( util.isEmpty(coinData) ) {

    // 알수없는 코인임을 말풍선으로 알려야 한다.
    responseBody.data.responseMsg = '현재 등록되지 않은 코인 정보 입니다'
    res.status(200).json(responseBody);
  }
  else {

    console.log('CMC 거래소 가격');

    responseBody.data.responseMsg = parseGeneralResponseMsg(coinData);
    console.log(responseBody.data.responseMsg);

    res.status(200).json(responseBody);
  }
  return;
}

var parseCoin_Name_Or_Symbol = function( coinHint ) {

  // exchange_cmc.forEach((data) => {
  //   data.
  // }

  console.log(exchange_cmc);

  const matchData = this.exchange_cmc.filter( element => {
    //console.log(element);
    
    element.name === coinHint || element.symbol === coinHint
  });

  //console.log(matchData);
}


function parseGeneralResponseMsg(coinData) {

	console.log(coinData);
 
	var openPrice = coinData.currentPrice;
  if( openPrice > 0 ) {
    openPrice = util.nameWithCommas(openPrice);
  }
  openPrice = openPrice+'달러';

  var fluctateRate = coinData.fluctate_rate_24;
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


// 코인리스트 나열시 말풍선
function parseCMCToGeneral(respDATA) {

    //this.exchange_cmc = [];

    var cmcCoins = [];

    respDATA.forEach((data)=>{

        var coin = coinPriceSpec;
        
        coin.name = data["name"].toLowerCase();
        coin.symbol = data["symbol"].toLowerCase();
        coin.id = data["id"];
        coin.currentPrice = data.quote.USD["price"]; //현재가
        coin.fluctate_rate_24 = data.quote.USD["percent_change_24h"];
        coin.volume_24 = data.quote.USD["volume_24h"];

        //console.log(`CMC Listing Data : ${coin.name}`);

        //console.log(coin);
        cmcCoins.push(coin);
    });

    this.exchange_cmc = cmcCoins;

    console.log("exchange_cmc content start");

    for(let i = 0; i < cmcCoins.length; i++){
      console.log(cmcCoins[i]);
    }
    // this.exchange_cmc.forEach( (imte) =>
    // {
    //   console.log(imte);
    // })
    
    console.log("exchange_cmc content end");
}

module.exports 						= polling_coin_price;
module.exports.coinPriceCommand = coinPriceCommand;

// http://localhost:3000/api/coinPrice
/* 사용자 "가격블록" request 샘플
{
    "bot": {
        "id": "66066c7dd954a304f009a28e",
        "name": "코인봇"
    },
    "intent": {
        "id": "660bab2f691ba24f6cd0fda5",
        "name": "가격",
        "extra": {
            "reason": {
                "code": 1,
                "message": "OK"
            }
        }
    },
    "action": {
        "id": "660bac6e1623006a29288627",
        "name": "코인가격 스킬",
        "params": {},
        "detailParams": {},
        "clientExtra": {}
    },
    "userRequest": {
        "block": {
            "id": "660bab2f691ba24f6cd0fda5",
            "name": "가격"
        },
        "user": {
            "id": "393970a60c945e0f2e530fac259cec6fd5fd5451dd451cd2d9f3c46160e6ae768d",
            "type": "botUserKey",
            "properties": {
                "botUserKey": "393970a60c945e0f2e530fac259cec6fd5fd5451dd451cd2d9f3c46160e6ae768d",
                "isFriend": true,
                "plusfriendUserKey": "Ge9E5OHpsO6L",
                "bot_user_key": "393970a60c945e0f2e530fac259cec6fd5fd5451dd451cd2d9f3c46160e6ae768d",
                "plusfriend_user_key": "Ge9E5OHpsO6L"
            }
        },
        "utterance": "!가격 btc",
        "params": {
            "surface": "Kakaotalk.plusfriend"
        },
        "lang": "ko",
        "timezone": "Asia/Seoul"
    },
    "contexts": []
}*/