const axios = require('axios');

// Memory variable to store ticker data
let binanceTickerData = {};
// Mapping of coin names to ticker symbols
let englisthCoinNameToTickerMap = {};

// Function to fetch and log USDT market data every 10 seconds
async function fetchAndLogBinanceTickerData() {
    try {
        console.log('---- 바이낸스 USDT 마켓 코인 [시세] 가져오기 ----');

        // Fetch 24hr ticker statistics from Binance API
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const tickers = response.data;

        // Filter and update the ticker data for USDT market only
        binanceTickerData = tickers.filter(ticker => ticker.symbol.endsWith('USDT')).reduce((acc, ticker) => {
            const key = ticker.symbol.replace('USDT', ''); // Remove 'USDT' from the key
            acc[key] = {
                price: ticker.lastPrice,
                highPrice: ticker.highPrice,
                lowPrice: ticker.lowPrice,
                volume: ticker.volume,
                priceChange: ticker.priceChange,
                priceChangePercent: ticker.priceChangePercent,
                timestamp: Date.now()
            };
            return acc;
        }, {});

        // Log the ticker data
        // console.log('Ticker Data Snapshot:', binanceTickerData);
        console.log('All ticker data updated:');
        console.log(`Number of tickers in binanceTickerData: ${Object.keys(binanceTickerData).length}`);

    } catch (error) {
        console.error('Error fetching ticker data from Binance:', error);
    }
}

// Function to fetch and populate englisthCoinNameToTickerMap from Binance API
async function fetchEnglishCoinNameToTickerMap() {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
        const symbols = response.data.symbols;

        symbols.forEach((symbol) => {
            if (symbol.quoteAsset === 'USDT') {
                const coinName = symbol.baseAsset; // Using baseAsset as a placeholder for coin name
                const ticker = symbol.symbol;
                englisthCoinNameToTickerMap[coinName] = ticker;
            }
        });

        console.log('Coin name to ticker map populated:', englisthCoinNameToTickerMap);
        console.log('---- 바인내스 USDT 마켓 코인 [목록]이 업데이트 되었습니다----');
    } catch (error) {
        console.error('Error fetching exchange info from Binance:', error);
    }
}

// Function to periodically fetch ticker data
function startFetchingTickerData() {
    fetchEnglishCoinNameToTickerMap();
    fetchAndLogBinanceTickerData(); // Initial fetch
    setInterval(fetchAndLogBinanceTickerData, 15 * 1000); // Fetch every 30 seconds
    setInterval(fetchEnglishCoinNameToTickerMap, 5 * 20 * 1000); // Fetch every 5분
}

module.exports = { binanceTickerData, fetchEnglishCoinNameToTickerMap, startFetchingTickerData };
