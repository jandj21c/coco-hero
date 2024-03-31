const util            = require('../util');
const coinPrice       = require('../coinPricePolling');
const eventPriceXRP   = require('../eventAPI/eventPriceXRP');


var bithumbXrpInfo  = {};
var upbitXrpInfo    = {};

var eventReadyXrpPrice ={};
eventReadyXrpPrice.init = function() {

	console.log('init - Fire XrpPrice 시작.');
	initFireXrpPrice();

};

function initFireXrpPrice() {

	//setInterval(fireXrpPrice, 1000 * 40); //
  setInterval(fireXrpPrice, 1000 * 3600 * 3); // 3시간마다
}

function fireXrpPrice() {

	console.log('fireXrpPrice - on time');

  bithumbXrpInfo  = coinPrice.exchangeList['bithumb'].coinList['xrp'];
  upbitXrpInfo    = coinPrice.exchangeList['upbit'].coinList['xrp'];

  message = makeXrpPriceEventMsg();

  var idList = [];
  idList[0] = "396cec1b746d8cbcd73f197f47391e27b3fd5451dd451cd2d9f3c46160e6ae768d"; // 리플챗봇 마스터
  idList[1] = "cc5df510aef1907b02df5861d5c52f45e662009c92340a7f6dd6af9afa0210e6ed"; // 지숙이
	//idList[2] = "04f47656e3bceac74c26072d147a0bb085c391162e3fd5f61b85efe8bb12e5e98a"; // 송영이

  eventPriceXRP.eventPriceOfXrp(idList, message);
}

/*
	var ex = exchangeList['bithumb'];
	ex.coinList[coinType].coinName = coinType;
	ex.coinList[coinType].currentPrice = respBithumb.data["closing_price"];
	ex.coinList[coinType].fluctate_24 = respBithumb.data["24H_fluctate"];
	ex.coinList[coinType].fluctate_rate_24 = respBithumb.data["24H_fluctate_rate"];
	ex.coinList[coinType].minPrice = respBithumb.data["min_price"];
	ex.coinList[coinType].maxPrice = respBithumb.data["max_price"];
	ex.coinList[coinType].volume_24 = respBithumb.data["units_traded"];
*/

function makeXrpPriceEventMsg() {

	//console.log('makeXrpPriceEventMsg');
  var bithumbPrice = makePriceText(bithumbXrpInfo.currentPrice);
  var bithumbFluctate = makefluctuationText(bithumbXrpInfo.fluctate_rate_24);

  var upbitPrice =  makePriceText(upbitXrpInfo.currentPrice);
  var upbitFluctate = makefluctuationText(upbitXrpInfo.fluctate_rate_24);

	var alimMessage = `
빗썸    : ${bithumbPrice} (${bithumbFluctate})
업비트 : ${upbitPrice} (${upbitFluctate})

⭐알림주기 - 30분마다🎵`;

  return alimMessage;
}

function makePriceText(openPrice) {

    if( openPrice > 0 ) {
      openPrice = util.nameWithCommas(openPrice);
    }

    openPrice = openPrice+'원';

    return openPrice;
}

function makefluctuationText(fluctateRate) {

  if( fluctateRate > 0){
    fluctateRate = '🔺+' +fluctateRate;
  }
  else {
    fluctateRate = '💧' +fluctateRate;
  }

  return fluctateRate+'%';
}

module.exports = eventReadyXrpPrice;
