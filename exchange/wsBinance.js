// Import the WebSocket library
const WebSocket = require('ws');
const axios = require('axios');

// Binance WebSocket endpoint
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

// Memory variable to store ticker data
let binanceTickerData = {};
// Mapping of coin names to ticker symbols
let englisthCoinNameToTickerMap = {};

// Function to connect to Binance WebSocket and fetch miniTicker data
function connectToBinance() {
    const ws = new WebSocket(`${BINANCE_WS_URL}/!miniTicker@arr`);

    ws.on('open', async () => {
        console.log('Connected to Binance WebSocket');

        await fetchEnglishCoinNameToTickerMap();

        // Send ping frame every 30 seconds to keep the connection alive
        setInterval(() => {
            ws.ping();
            console.log('Ping sent to Binance');
        }, 30000);
    });

    ws.on('pong', () => {
        console.log('Pong received from Binance');
    });

    ws.on('message', (message) => {
        try {
            const tickers = JSON.parse(message);

            // Update the ticker data in memory for USDT market only
            tickers.forEach((ticker) => {
                if (ticker.s.endsWith('USDT')) {
                    binanceTickerData[ticker.s] = {
                        price: ticker.c,
                        volume: ticker.v,
                        timestamp: Date.now()
                    };
                }
            });
        } catch (error) {
            console.error('Error parsing miniTicker data:', error);
        }
    });

    ws.on('close', () => {
        console.log('Binance WebSocket closed. Reconnecting in 5 seconds...');
        setTimeout(connectToBinance, 5000); // Reconnect after 5 seconds
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close();
    });
}

// Function to log all ticker data every 10 seconds
function logbinanceTickerData() {
    setInterval(() => {
        console.log('Ticker Data Snapshot:', binanceTickerData);
    }, 10000);
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
    } catch (error) {
        console.error('Error fetching exchange info from Binance:', error);
    }
}

module.exports = { binanceTickerData, connectToBinance, fetchEnglishCoinNameToTickerMap, logbinanceTickerData };