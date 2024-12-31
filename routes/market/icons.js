const axios = require('axios');

let coinIconUrlCache = {}; // ex) 'PEPE': 'https://assets.coingecko.com/coins/images/...'
let coinIconListData = {};

async function InitCoinIconList(ticker, size = 'large') {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
    if (response.data){
        console.log(`Initiated COINGECKO Icon Image List`);
    }

    coinIconListData = response.data;
}

// Function to fetch coin icon URL by ticker and size
async function getCoinIconUrl(ticker, size = 'large') {
    try {
        // Validate size parameter
        const validSizes = ['thumb', 'small', 'large'];
        if (!validSizes.includes(size)) {
            throw new Error(`Invalid size parameter. Valid sizes are: ${validSizes.join(', ')}`);
        }

        // Check if the ticker data is already in the cache
        if (coinIconUrlCache[ticker] && coinIconUrlCache[ticker][size]) {
            console.log(`hit coin icon cache ${ticker}, ${size}`);
            return coinIconUrlCache[ticker][size];
        }

        // Fetch coin list from CoinGecko API
        // const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
        // const coins = response.data;

        // Find the coin ID corresponding to the ticker
        const coinData = coinIconListData.find(coin => coin.symbol.toUpperCase() === ticker.toUpperCase());

        if (coinData) {
            // Fetch detailed coin data to retrieve image URLs
            const coinDetails = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinData.id}`);
            const iconUrls = {
                thumb: coinDetails.data.image.thumb,
                small: coinDetails.data.image.small,
                large: coinDetails.data.image.large,
            };

            // Cache the URLs for this ticker
            coinIconUrlCache[ticker] = iconUrls;

            // Return the requested size
            return iconUrls[size];
        } else {
            console.warn(`Coin icon for ticker ${ticker} not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching coin icon URL for ${ticker}:`, error);
        return null;
    }
}

// Example usage
async function testGetCoinIconUrl() {
    const ticker = 'BTC'; // Example ticker
    const size = 'small'; // Example size ('thumb', 'small', or 'large')
    const iconUrl = await getCoinIconUrl(ticker, size);
    console.log(`Icon URL for ${ticker} (${size}):`, iconUrl);
}

// Call the test function (remove in production)
//testGetCoinIconUrl();

module.exports = { InitCoinIconList, getCoinIconUrl };