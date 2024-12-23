// Import the Axios library
const axios = require('axios');

// Memory variable to store ticker data
let upbitTickerData = {}; // 티커맵
let koreanCoinNameToTickerMap = {}; // 예시) '비트코인': 'KRW-BTC', '이더리움': 'KRW-ETH',


async function fetchUpbitTickerData() {
    try {
        console.log('---- 업비트 원화 마켓 코인 [목록]과 [시세] 가져오기 ----');

         // Temporary object for new data
        var newTickerData = {};
        
        // Fetch KRW market codes using fetchKoreanCoinNameToTickerMap
        await fetchKoreanCoinNameToTickerMap();
        const krwMarketCodes = Object.keys(koreanCoinNameToTickerMap)
            .filter((coinName) => koreanCoinNameToTickerMap[coinName].startsWith('KRW-'))
            .map((coinName) => koreanCoinNameToTickerMap[coinName]);

        // Fetch ticker data for all KRW market codes in one request
        const response = await axios.get(`https://api.upbit.com/v1/ticker?markets=${krwMarketCodes.join(',')}`);
        const data = response.data;

        // Update ticker data
        // Populate newTickerData
        data.forEach((item) => {
            const ticker = item.market.replace('KRW-', '');
            newTickerData[ticker] = {
                price: item.trade_price,
                volume: item.acc_trade_volume_24h,
                high: item.high_price,
                low: item.low_price,
                change: item.signed_change_rate, //Double
                timestamp: Date.now() //Long
            };
            //console.log(`Updated data for ${ticker}:`, upbitTickerData[ticker]);
        });

        upbitTickerData = newTickerData;

        //console.log('All ticker data updated:', upbitTickerData);
        console.log('All ticker data updated:');
        console.log(`Number of tickers in upbitTickerData: ${Object.keys(upbitTickerData).length}`);
    } catch (error) {
        console.error('Error fetching ticker data from Upbit:', error);
    }
}

// Function to periodically fetch ticker data
function startFetchingTickerData() {
    fetchUpbitTickerData(); // Initial fetch
    setInterval(fetchUpbitTickerData, 15 * 1000); // Fetch every 15 seconds
}

async function fetchKoreanCoinNameToTickerMap() {
    try {
        const response = await axios.get('https://api.upbit.com/v1/market/all');
        const markets = response.data;

        // 예시)
        // '비트코인': 'KRW-BTC',
        // '이더리움': 'KRW-ETH',
        
        markets.forEach((market) => {
            if (market.market.startsWith('KRW-')) { // Fetch only KRW market pairs
                const coinName = market.korean_name; // Korean coin name
                const ticker = market.market; // Use KRW- prefixed market ticker
                koreanCoinNameToTickerMap[coinName] = ticker;
            }
        });

        console.log('Korean coin name to ticker map populated for KRW markets:', koreanCoinNameToTickerMap);
        console.log('---- 업비트 원화 마켓 코인 [목록]이 업데이트 되었습니다 ----');
    } catch (error) {
        console.error('Error fetching market info from Upbit:', error);
    }
}

// 한글이든 티커든 입력된 값을 순수 티커 (krw-btc 면 btc ) 로 가져온다.
function findUpbitPureTicker(inputString) {
    for (const [key, value] of Object.entries(koreanCoinNameToTickerMap)) {
        // Check if the input matches the key
        if (key === inputString) {
            return value.replace('KRW-', '');
        }

        // Check if the input matches the value without "KRW-"
        const strippedValue = value.replace('KRW-', '');
        if (strippedValue === inputString) {
            return strippedValue;
        }
    }
    return null; // Return null if no match is found
}

module.exports = { upbitTickerData, koreanCoinNameToTickerMap, startFetchingTickerData, fetchKoreanCoinNameToTickerMap, findUpbitPureTicker };
