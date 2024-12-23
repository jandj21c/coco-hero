var wsBinance = require('../../exchange/wsBinance');
var wsUpbit = require('../../exchange/wsUpbit');

const axios = require('axios');

// 외부에서 호출하는 엔트리
function initExchange() {

	console.log('initialize ticker mapping. 3시간 마다 티커 매핑');

    // 거래소 가격 가져오기 시작
	initPolling();

};

function initPolling() {

    console.log('initialize exchange polling. 거래소 폴링 시작.');

    wsBinance.startFetchingTickerData();
    //wsUpbit.startFetchingTickerData();
}

// Function to get the current price of a specific ticker
function getTickerPrice(ticker) {
    if (wsBinance.binanceTickerData[ticker]) {
        return wsBinance.binanceTickerData[ticker].price;
    } else {
        console.log(`Ticker ${ticker} not found or no data available.`);
        return null;
    }
}

// Function to convert a coin name to its ticker symbol
function getTickerFromBinance(englishCoinName) {
    const tickerUSDT = wsBinance.englisthCoinNameToTickerMap[englishCoinName];
    
    // englishCoinName : tikerUSDT
    // ㄴ-> ex) PEPE: 'PEPEUSDT', 

    if (tickerUSDT) {
        return englishCoinName;
    } else {
        console.log(`Coin name ${englishCoinName} not found in mapping.`);
        return null;
    }
}

function getTickerFromUpbit(koreanCoinName_or_krwTicker) {
    const pureTicker = wsUpbit.findUpbitPureTicker(koreanCoinName_or_krwTicker);
    if (pureTicker) {
        return pureTicker;
    } else {
        console.log(`Korean coin name ${koreanCoinName_or_krwTicker} not found in mapping.`);
        return null;
    }
}

// Function to get the current price by any identifier (Korean name, English name, or ticker)
function getPriceByIdentifier(identifier) {
    var price = 0;

    const ticker = getTickerFromUpbit(identifier);
    if (ticker && wsUpbit.upbitTickerData[ticker])
    {
        // upbit
        price = wsUpbit.upbitTickerData[ticker].price;
        console.log(`${identifier} 가격은 ${price} KRW 입니다`);
        return price;
    }
    else if (wsBinance.binanceTickerData[identifier])
    {
        // binance
        price = wsBinance.binanceTickerData[identifier].price;
        console.log(`${identifier} 가격은 ${price} USDT 입니다`);
        return price;
    }

    console.log(`Identifier ${identifier} could not be resolved to a ticker or no data available.`);
    return null;
}

module.exports = { initExchange, getTickerPrice, getTickerFromBinance, getTickerFromUpbit, getPriceByIdentifier };