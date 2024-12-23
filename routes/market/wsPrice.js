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
    wsUpbit.startFetchingTickerData();
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
function getTickerByCoinName(coinName) {
    const ticker = coinNameToTickerMap[coinName];
    if (ticker) {
        return ticker;
    } else {
        console.log(`Coin name ${coinName} not found in mapping.`);
        return null;
    }
}

// Function to convert a Korean coin name to its ticker symbol
function getTickerByKoreanCoinName(koreanCoinName) {
    const ticker = koreanCoinNameToTickerMap[koreanCoinName];
    if (ticker) {
        return ticker;
    } else {
        console.log(`Korean coin name ${koreanCoinName} not found in mapping.`);
        return null;
    }
}

// Function to get the current price by any identifier (Korean name, English name, or ticker)
function getPriceByIdentifier(identifier) {
    let ticker = identifier;

    if (!wsBinance.binanceTickerData[ticker]) {
        ticker = getTickerByCoinName(identifier) || getTickerByKoreanCoinName(identifier);
    }

    if (ticker && wsBinance.binanceTickerData[ticker]) {
        return wsBinance.binanceTickerData[ticker].price;
    } else {
        console.log(`Identifier ${identifier} could not be resolved to a ticker or no data available.`);
        return null;
    }
}

module.exports = { initExchange, getTickerPrice, getTickerByCoinName, getTickerByKoreanCoinName, getPriceByIdentifier };