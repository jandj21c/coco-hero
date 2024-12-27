const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

let lastTitle = ''; // 마지막으로 감지된 속보 제목 저장

async function fetchLatestBreakingNews() {
  try {
    const BASE_URL = 'https://coinness.com';
    const response = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 속보 항목 선택
    const newsItem = $('.BreakingNewsContentWrap-sc-glfxh-3').first(); // 첫 번째 속보
    const time = newsItem.prev('.TimeBlock-sc-glfxh-2').text().trim(); // 시간 추출
    const title = newsItem.find('.BreakingNewsTitle-sc-glfxh-4 a').text().trim(); // 제목 추출
    const link = BASE_URL + newsItem.find('.BreakingNewsTitle-sc-glfxh-4 a').attr('href'); // 링크 추출
    const content = newsItem.find('.BreakingNewsContents-sc-glfxh-5').text().trim(); // 본문 추출

    if (title !== lastTitle) { // 새로운 속보 확인
      lastTitle = title; // 최신 제목 저장
      console.log(`속보 시간: ${time}`);
      console.log(`제목: ${title}`);
      console.log(`본문: ${content}`);
      console.log(`링크: ${link}`);
      console.log('--------------------');
    } else {
      console.log('새로운 속보가 없습니다.');
    }
  } catch (error) {
    console.error('코인 뉴스 모니터링 오류 발생:', error.message);
  }
}

function startMonitorBreackingNews(){
    //첫 1회
    console.log('속보 확인 중...');
    fetchLatestBreakingNews();

    // 1분마다 실행
    cron.schedule('*/1 * * * *', () => {
    console.log('속보 확인 중...');
    fetchLatestBreakingNews();
    });
}

module.exports = { startMonitorBreackingNews };
