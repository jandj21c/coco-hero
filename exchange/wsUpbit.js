// Import the WebSocket library
const WebSocket = require('ws');
const axios = require('axios');

// Binance WebSocket endpoint
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

// Memory variable to store ticker data
let upbitTickerData = {};
let koreanCoinNameToTickerMap = {};

function connectToUpbit() {
    const { v4: uuidv4 } = require('uuid');
    const ws = new WebSocket('wss://api.upbit.com/websocket/v1');

    ws.on('open', async () => {
        console.log('Connected to Upbit WebSocket');

        // Fetch KRW market codes using fetchKoreanCoinNameToTickerMap
        await fetchKoreanCoinNameToTickerMap();
        const krwMarketCodes = Object.keys(koreanCoinNameToTickerMap)
            .filter((coinName) => koreanCoinNameToTickerMap[coinName].startsWith('KRW-'))
            .map((coinName) => koreanCoinNameToTickerMap[coinName]);

        // Send subscription message to receive snapshot data for KRW pairs
        ws.send(JSON.stringify([
            { ticket: uuidv4() },
            { type: 'ticker', codes: krwMarketCodes, is_only_snapshot: true } // Snapshot mode enabled
        ]));

        // Send ping frame every 10 seconds to keep the connection alive
        setInterval(() => {
            ws.ping();
            console.log('Ping sent to Upbit');
        }, 10000);
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'ticker') {
                const ticker = data.code.replace('KRW-', '');
                upbitTickerData[ticker] = {
                    price: data.trade_price,
                    volume: data.acc_trade_volume_24h,
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            console.error('Error parsing Upbit ticker data:', error);
        }
    });

    ws.on('close', () => {
        console.log('Upbit WebSocket closed. Reconnecting in 5 seconds...');
        setTimeout(connectToUpbit, 5000); // Reconnect after 5 seconds
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close();
    });
}


// Function to log all ticker data every 10 seconds
function logUpbitTickerData() {
    setInterval(() => {
        console.log('Ticker Data Snapshot:', upbitTickerData);
    }, 10000);
}

async function fetchKoreanCoinNameToTickerMap() {
    try {
        const response = await axios.get('https://api.upbit.com/v1/market/all');
        const markets = response.data;

        markets.forEach((market) => {
            if (market.market.startsWith('KRW-')) { // Fetch only KRW market pairs
                const coinName = market.korean_name; // Korean coin name
                const ticker = market.market; // Use KRW- prefixed market ticker
                koreanCoinNameToTickerMap[coinName] = ticker;
            }
        });

        console.log('Korean coin name to ticker map populated for KRW markets:', koreanCoinNameToTickerMap);
    } catch (error) {
        console.error('Error fetching market info from Upbit:', error);
    }
}

module.exports = { upbitTickerData, koreanCoinNameToTickerMap, connectToUpbit, logUpbitTickerData, fetchKoreanCoinNameToTickerMap };