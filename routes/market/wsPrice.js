var wsBinance = require('../../exchange/wsBinance');
const axios = require('axios');

// Mapping of coin names to ticker symbols
let coinNameToTickerMap = {};
let koreanCoinNameToTickerMap = {};

// 외부에서 호출하는 엔트리
function initExchange() {

	console.log('initialize ticker mapping. 3시간 마다 티커 매핑');

    // 코인 영어 이름 -> 티커 매핑 (바이낸스 API)
    fetchCoinNameToTickerMap();
    setInterval(fetchCoinNameToTickerMap, 3 * 60 * 60 * 1000); // 3시간 마다 갱신

    // 코인 한국 이름 -> 티커 매핑 (업비트 API)
    fetchKoreanCoinNameToTickerMap();
    setInterval(fetchKoreanCoinNameToTickerMap, 3 * 60 * 60 * 1000); // 3시간 마다 갱신

    // 거래소 가격 가져오기 시작
	initPolling();

};

function initPolling() {

    console.log('initialize exchange polling. 거래소 폴링 시작.');

    wsBinance.connectToBinance();
    wsBinance.logTickerData();

    // Start the WebSocket connection and logging
    // fetchCoinNameToTickerMap().then(() => {
    //     connectToBinance();
    //     logTickerData();
    // });
}

// Function to fetch and populate coinNameToTickerMap from Binance API
async function fetchCoinNameToTickerMap() {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
        const symbols = response.data.symbols;

        symbols.forEach((symbol) => {
            if (symbol.quoteAsset === 'USDT') {
                const coinName = symbol.baseAsset; // Using baseAsset as a placeholder for coin name
                const ticker = symbol.symbol;
                coinNameToTickerMap[coinName] = ticker;
            }
        });

        console.log('Coin name to ticker map populated:', coinNameToTickerMap);
    } catch (error) {
        console.error('Error fetching exchange info from Binance:', error);
    }
}

// Function to fetch and populate koreanCoinNameToTickerMap from Upbit API
async function fetchKoreanCoinNameToTickerMap() {
    try {
        const response = await axios.get('https://api.upbit.com/v1/market/all');
        const markets = response.data;

        markets.forEach((market) => {
            if (market.market.startsWith('USDT-')) {
                const coinName = market.korean_name; // Korean coin name
                const ticker = market.market.replace('USDT-', '') + 'USDT'; // Convert to Binance-style ticker
                koreanCoinNameToTickerMap[coinName] = ticker;
            }
        });

        console.log('Korean coin name to ticker map populated:', koreanCoinNameToTickerMap);
    } catch (error) {
        console.error('Error fetching market info from Upbit:', error);
    }
}

// Function to log all ticker data every 10 seconds
function logTickerData() {
    setInterval(() => {
        console.log('Ticker Data Snapshot:', wsBinance.tickerData);
    }, 10000);
}

// Function to get the current price of a specific ticker
function getTickerPrice(ticker) {
    if (wsBinance.tickerData[ticker]) {
        return wsBinance.tickerData[ticker].price;
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

    if (!wsBinance.tickerData[ticker]) {
        ticker = getTickerByCoinName(identifier) || getTickerByKoreanCoinName(identifier);
    }

    if (ticker && wsBinance.tickerData[ticker]) {
        return wsBinance.tickerData[ticker].price;
    } else {
        console.log(`Identifier ${identifier} could not be resolved to a ticker or no data available.`);
        return null;
    }
}

module.exports = { initExchange, getTickerPrice, getTickerByCoinName, getTickerByKoreanCoinName, getPriceByIdentifier };