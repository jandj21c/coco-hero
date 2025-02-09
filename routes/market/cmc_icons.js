require('dotenv').config();
const axios = require('axios');
const db = require('../../db/mongoTest'); // 파일 경로를 정확히 입력하세요.

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

  //DB에 있는지 확인
  try {
    const logoUrl = await db.readIconData(symbol);
    if (logoUrl) {
      //console.log(`Symbol '${symbol}' DB 에 존재`);
      return logoUrl;
    } else {
      console.log(`Symbol '${symbol}'에 대한 DB 데이터를 찾을 수 없습니다.`);
    }
  } catch (error) {
    console.error('데이터 조회 중 오류 발생:', error.message);
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
      // 캐시에 저장
      //logoCache[symbol] = logoUrl;

      // DB에 저장
      const iconData = {
        symbol: symbol,
        id: data.data[symbol].id,
        name: data.data[symbol].name,
        logoUrl: data.data[symbol].logo,
        description: data.data[symbol].description,
      };
    
      try {
        const result = await db.insertIconData(iconData);
        console.log('[아이콘 DB] 삽입된 데이터 ID:', result.insertedId);
      } catch (error) {
        console.error('[아이콘 DB] 데이터 삽입 중 오류 발생:', error.message);
      }
      return iconData.logoUrl;
      
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
