const axios = require('axios');

// Memory variable to store ticker data
let binanceTickerData = {}; //  ex) key : 'PEPE', value : datas...
// Mapping of coin names to ticker symbols
let englisthCoinNameToTickerMap = {}; //대문자 주의!  ex) 'PEPE': 'PEPEUSDT',

// Function to fetch and log USDT market data every 10 seconds
async function fetchAndLogBinanceTickerData() {
    try {
        console.log('---- 바이낸스 USDT 마켓 코인 [시세] 가져오기 ----');

         // Temporary object for new data
        var newTickerData = {};

        // Fetch 24hr ticker statistics from Binance API
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const tickers = response.data;

        // Filter and update the ticker data for USDT market only
        newTickerData = tickers.filter(ticker => ticker.symbol.endsWith('USDT')).reduce((acc, ticker) => {
            const key = ticker.symbol.replace('USDT', ''); // Remove 'USDT' from the key
            acc[key] = {
                // 업비트와 구조가 동일하기 때문에 필드 변경하면 안됨
                price: ticker.lastPrice,
                volume: ticker.volume,
                high: ticker.highPrice,
                low: ticker.lowPrice,
                change: ticker.priceChangePercent, // 변화율
                timestamp: Date.now(),

                fixedTicker : key,
                exchange : `binance`
            };
            return acc;
        }, {});

        // ex) binanceTickerData 값
        // HIFI: {
        //     price: '0.52660000',
        //     volume: '7538775.20000000',
        //     high: '0.54710000',
        //     low: '0.50900000',
        //     change: '0.324',
        //     timestamp: 1734968746076
        //   },

        Object.assign(binanceTickerData, newTickerData);

        //console.log('Ticker Data Snapshot:', binanceTickerData);
        console.log(`[Binance Price Updated] Number of tickers : ${Object.keys(binanceTickerData).length}`);

    } catch (error) {
        console.error('Error fetching ticker data from Binance:', error);
    }
}

// Function to fetch and populate englisthCoinNameToTickerMap from Binance API
async function fetchEnglishCoinNameToTickerMap() {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
        const symbols = response.data.symbols;

        // ex) PEPE: 'PEPEUSDT',

        symbols.forEach((symbol) => {
            if (symbol.quoteAsset === 'USDT') {
                const coinName = symbol.baseAsset; // Using baseAsset as a placeholder for coin name
                const ticker = symbol.symbol;
                englisthCoinNameToTickerMap[coinName] = ticker;
            }
        });

        //console.log('Coin name to ticker map populated:', englisthCoinNameToTickerMap);

        console.log('[Binance Ticker List Updated]');
    } catch (error) {
        console.error('Error fetching exchange info from Binance:', error);
    }
}

// Function to periodically fetch ticker data
async function startFetchingTickerData() {
    fetchEnglishCoinNameToTickerMap();
    await fetchAndLogBinanceTickerData(); // Initial fetch
    setInterval(fetchAndLogBinanceTickerData, 20 * 1000); // Fetch every 20 seconds
    setInterval(fetchEnglishCoinNameToTickerMap, 5 * 20 * 1000); // Fetch every 5분
}

module.exports = { binanceTickerData, englisthCoinNameToTickerMap, fetchEnglishCoinNameToTickerMap, startFetchingTickerData };
