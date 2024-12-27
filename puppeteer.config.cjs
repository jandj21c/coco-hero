// render 가 chromium 을 설치하게 한다
const { join } = require('path');
/**
* @type {import("puppeteer").Configuration}
*/
module.exports = { cacheDirectory: join(__dirname, '.cache', 'puppeteer') };