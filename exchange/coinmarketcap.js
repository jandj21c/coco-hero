// Restfull API

//const axios = require('axios');
// let response = null;
// new Promise(async (resolve, reject) => {
//   try {
//     response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
//       headers: {
//         'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
//       },
//     });
//   } catch(ex) {
//     response = null;
//     // error
//     console.log(ex);
//     reject(ex);
//   }
//   if (response) {
//     // success
//     const json = response.data;
//     console.log(json);
//     resolve(json);
//   }
// });


var request = require('request');

var queryCMCPrice = function (callback) {
	var options = {
		headers: {
			'X-CMC_PRO_API_KEY': 'a7ee27df-e9af-4165-8a17-6f9f8f4033e7' //졔
			//'X-CMC_PRO_API_KEY': '952dd564-05e3-420a-8674-6a178fea19c9',
		},
		uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100',

		method: 'GET'
	};

	var res = '';
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res = body;
			//console.log(res);
		}
		else {
			console.log("CMC Listing API request failed");
			res = null; //-1121 error
		}
		callback(res);
	});
}

// var parseCoinNameForCMC = function (coinName) {

// 	var query = coinName+"USDT";
// 	query = query.toUpperCase();

// 	return query;
// }

module.exports.queryCMCPrice = queryCMCPrice;