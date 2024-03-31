
// Restfull API 요청
var util = require('../util')
var request = require('request');

var queryCoinPrice = function(queryCoin, callback) {
        var options = {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            uri : 'https://api.bithumb.com/public/ticker/' + queryCoin,
            method : 'GET'
        };

        var res = '';
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res = body;
            }
            else {
                res = null;
            }
            callback(queryCoin, res);
        });
    }


var coinQuerybithumb = function(queryCoinType, coinName, callback) {
    //queryCoinPrice(queryCoinType, function(resp) {

    var options = {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        uri : 'https://api.bithumb.com/public/ticker/' + queryCoinType,
        method : 'GET'
    };

    var responseMsg = '';
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var respJson = JSON.parse(body);

            if( respJson.status == '0000') {
              responseMsg = parseResponseMsg(coinName, respJson);
            }
            else {
              responseMsg = '코인 정보가 없습니다';
            }
        }
        else {
            responseMsg = '코인 정보가 없습니다';

        }
        console.log(responseMsg);

        callback(responseMsg);
    });
}


// 코인시세 개별호출
var parseResponseMsg = function( coinName, respJson ){

  var responseMsg;

  var openPrice = respJson.data["closing_price"];
  if( openPrice > 0 ) {
    openPrice = util.nameWithCommas(openPrice);
  }
  openPrice = openPrice+'원';

  var fluctate = respJson.data["fluctate_24H"];
  if( fluctate > 0){
    fluctate = util.nameWithCommas(fluctate);
    fluctate ='🔺+' +fluctate;
  }
  else {
    fluctate = util.nameWithCommas(fluctate);
    fluctate ='💧' +fluctate;
  }
  fluctate = fluctate+'원';

  var fluctateRate = respJson.data["fluctate_rate_24H"];
  if( fluctateRate > 0){
    fluctateRate = '+' +fluctateRate;
  }

  var maxPrice = util.nameWithCommas(respJson.data["max_price"]);
  var minPrice = util.nameWithCommas(respJson.data["min_price"]);

  const upperCoinName = coinName.toUpperCase();

  responseMsg = ` ${upperCoinName} 의 현재 가격은
 ${openPrice} (${fluctate}) 입니다.

 변동률 : ${fluctateRate}%
 최저가 : ${minPrice}
 최고가 : ${maxPrice}`;

  return responseMsg;
}

module.exports.queryCoinPrice = queryCoinPrice;
module.exports.coinQuerybithumb = coinQuerybithumb;
