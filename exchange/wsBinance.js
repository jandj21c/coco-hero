// Import the WebSocket library
const WebSocket = require('ws');
const axios = require('axios');

// Binance WebSocket endpoint
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

// Memory variable to store ticker data
let tickerData = {};

// Function to connect to Binance WebSocket and fetch miniTicker data
function connectToBinance() {
    const ws = new WebSocket(`${BINANCE_WS_URL}/!miniTicker@arr`);

    ws.on('open', () => {
        console.log('Connected to Binance WebSocket');
    });

    ws.on('message', (message) => {
        try {
            const tickers = JSON.parse(message);

            // Update the ticker data in memory for USDT market only
            tickers.forEach((ticker) => {
                if (ticker.s.endsWith('USDT')) {
                    tickerData[ticker.s] = {
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
function logTickerData() {
    setInterval(() => {
        console.log('Ticker Data Snapshot:', tickerData);
    }, 10000);
}

module.exports = { tickerData, connectToBinance, logTickerData };