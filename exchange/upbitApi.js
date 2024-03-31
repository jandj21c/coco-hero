
// Restfull API ��û
var util = require('../util')
var request = require('request');

var queryCoinPrice = function (queryCoin, callback) {
	var options = {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		uri: 'https://api.upbit.com/v1/ticker?markets=' + parseCoinNameForUpbit(queryCoin),
		method: 'GET'
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
	//[
	//	{
	//		"market": "KRW-BTC",
	//		"trade_date": "20180418",
	//		"trade_time": "102340",
	//		"trade_date_kst": "20180418",
	//		"trade_time_kst": "192340",
	//		"trade_timestamp": 1524047020000,
	//		"opening_price": 8450000,
	//		"high_price": 8679000,
	//		"low_price": 8445000,
	//		"trade_price": 8621000,
	//		"prev_closing_price": 8450000,
	//		"change": "RISE",
	//		"change_price": 171000,
	//		"change_rate": 0.0202366864,
	//		"signed_change_price": 171000,
	//		"signed_change_rate": 0.0202366864,
	//		"trade_volume": 0.02467802,				//���� �ֱ� �ŷ���
	//		"acc_trade_price": 108024804862.58254,	//���� �ŷ�����(UTC 0�� ����)
	//		"acc_trade_price_24h": 232702901371.09309, //24시간 누적 거래대금
	//		"acc_trade_volume": 12603.53386105,		//���� �ŷ���(UTC 0�� ����)
	//		"acc_trade_volume_24h": 27181.31137002,	//24�ð� ���� �ŷ�����
	//		"highest_52_week_price": 28885000,
	//		"highest_52_week_date": "2018-01-06",
	//		"lowest_52_week_price": 4175000,
	//		"lowest_52_week_date": "2017-09-25",
	//		"timestamp": 1524047026072
	//	}
	//]

	//
	//change

	//EVEN: ����
	//RISE: ����
	//FALL: �϶�
}

var parseCoinNameForUpbit = function (coinName) {

	return 'krw-' + coinName;
}


module.exports.queryCoinPrice = queryCoinPrice;
