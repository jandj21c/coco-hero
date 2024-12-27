const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

let lastTitle = ''; // 마지막으로 감지된 속보 제목 저장

async function fetchLatestBreakingNewsOne() {
  try {
    const BASE_URL = 'https://coinness.com';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://coinness.com/', { waitUntil: 'networkidle2' });

    const content = await page.content();
    const $ = cheerio.load(content);

    const time = $('[class^="TimeBlock-sc-glfxh-2"]').first().text().trim();
    const link = BASE_URL + $('[class^="BreakingNewsTitle-sc-glfxh-4"] a').first().attr('href');
    const title = $('[class^="BreakingNewsTitle-sc-glfxh-4"]').first().text().trim();
    const desc = $('[class^="BreakingNewsContents-sc-glfxh-5"] span').first().text().trim();
    
    await browser.close();

    if (lastTitle ===""){
        lastTitle = title; // 최신 제목 저장

        console.log(`---[서버최초] 코인니스에서 가져온 최신 속보---`);
        console.log(`속보 시간: ${time}`);
        console.log(`제목: ${title}`);
        console.log(`링크: ${link}`);
        console.log(`내용: ${desc}`);
        console.log('--------------------------------');
        return;
    }

    if (title !== lastTitle) { // 새로운 속보 확인
      lastTitle = title; // 최신 제목 저장

      console.log(`---[NEW] 코인니스에서 가져온 최신 속보---`);
      console.log(`속보 시간: ${time}`);
      console.log(`제목: ${title}`);
      console.log(`본문: ${content}`);
      console.log(`링크: ${link}`);
      console.log(`링크: ${desc}`);
      console.log('--------------------------------');
    } else {
      console.log('새로운 속보가 없습니다.');
    }
  } catch (error) {
    console.error('Error fetching or parsing the page:', error);
  }
}

function startMonitorBreackingNews(){
    //첫 1회
    console.log('속보 확인 중...');
    fetchLatestBreakingNewsOne();

    // 1분마다 실행
    cron.schedule('*/1 * * * *', () => {
    console.log('속보 확인 중...');
    fetchLatestBreakingNewsOne();
    });
}

module.exports = { startMonitorBreackingNews };
