const axios = require('axios');

// CoinMarketCap API 키
const apiKey = process.env.CMC_API_KEY;

// API 엔드포인트
const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info`;

// 캐시 객체
const logoCache = {};

/**
 * 로고 URL 가져오기 함수
 * @param {string} symbol - 코인 티커 (예: BTC, ETH)
 * @returns {Promise<string>} - 로고 URL 또는 에러 메시지
 */
async function getLogoUrl(symbol) {
  // 캐시에 로고 URL이 있는지 확인
  if (logoCache[symbol]) {
    console.log(`Icon URL Cache hit for ${symbol}`);
    return logoCache[symbol];
  }

  // API 요청 옵션 설정
  const options = {
    method: 'GET',
    url: url,
    headers: {
      'X-CMC_PRO_API_KEY': apiKey
    },
    params: {
      symbol: symbol
    }
  };

  try {
    // API 요청
    const response = await axios(options);
    const data = response.data;

    if (data && data.data && data.data[symbol]) {
      const logoUrl = data.data[symbol].logo;

      // 캐시에 저장
      logoCache[symbol] = logoUrl;
      console.log(`Icon URL Fetched from API and cached: ${symbol}`);
      return logoUrl;
    } else {
      throw new Error(`Icon URL No data found for symbol: ${symbol}`);
    }
  } catch (error) {
    console.error('Icon URL Error fetching data from CoinMarketCap API:', error.response?.data || error.message);
    throw error;
  }
}

// 함수 사용 예시
/*
(async () => {
  try {
    const btcLogo = await getLogoUrl('BTC');
    console.log(`BTC Logo URL: ${btcLogo}`);

    // 두 번째 호출은 캐시된 값을 사용
    const cachedBtcLogo = await getLogoUrl('BTC');
    console.log(`Cached BTC Logo URL: ${cachedBtcLogo}`);
  } catch (error) {
    console.error(error.message);
  }
})();
*/

module.exports = { getLogoUrl };
