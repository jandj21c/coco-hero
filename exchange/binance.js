
// Restfull API

var util = require('../util')
var request = require('request');

var queryCoinPrice = function (queryCoin, callback) {
	var options = {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		uri: 'https://api.binance.com/api/v1/ticker/24hr?symbol=' + parseCoinNameForBinance(queryCoin),
		method: 'GET'
	};

	var res = '';
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res = body;
		}
		else {
			res = null; //-1121 error
		}
		callback(queryCoin, res);
	});

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
}

var parseCoinNameForBinance = function (coinName) {

	var query = coinName+"USDT";
	query = query.toUpperCase();

	return query;
}

module.exports.queryCoinPrice = queryCoinPrice;
