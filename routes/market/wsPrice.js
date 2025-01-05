var wsBinance = require('../../exchange/wsBinance');
var wsUpbit = require('../../exchange/wsUpbit');
var icons = require('./cmc_icons');
var balloons = require('../../balloons/templateBalloons');
var util     = require('../../util');
const log = require('../../logger');


// 외부에서 호출하는 엔트리
async function initExchangeData() {

    console.log('거래소 폴링 시작');

    await wsBinance.startFetchingTickerData();
    await wsUpbit.startFetchingTickerData();

    if (process.env.NODE_ENV === 'development') {
      //test:
      setTimeout(() => {
        _parseItemCardBalloon(getSearchCoinData("PEOPLE")); 
      }, 5000);
    }
}

async function coinPriceCommand(req, res) {

  console.log('-------------- coinPriceCommand req COMMING ----------------');
  //console.log('----------- coinPriceCommand chat bot server request body -------------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('----------- coinPriceCommand chat bot server request end -----------');

  console.log(JSON.stringify(req.body, null, 4));

  let coinName;

  if ( req.body && req.body.userRequest.utterance && req.body.userRequest.utterance.trim()) {

    let utter = req.body.userRequest.utterance.trim(); // 앞뒤 공백 제거
  
    coinName = utter.toUpperCase(); 
    if (coinName.length < 2) {
      res.status(200).json(balloons.makeTemplateErrorText("티커명은 2자 이상입니다."));
      return;
    }

    console.log(JSON.stringify(`사용자가 시세 정보를 요청한 코인: ${coinName}`));
  }
  else {
    res.status(200).json(balloons.makeTemplateErrorText("코인 가격 검색 요청이 올바르지 않습니다."));
    return;
  }

  // 거래소에 등록된 코인인지 확인
  let registerCoinData = getSearchCoinData(coinName);
  if (!registerCoinData) {
    res.status(200).json(balloons.makeTemplateErrorText("해당 코인이름은 등록되어 있지 않습니다. 코인이름 혹은 티커를 입력해주세요"));
    return;
  }

  // 거래소에서 가져온 코인 정보로 말풍선을 만든다
  _parseItemCardBalloon(registerCoinData)
    .then(resbody => {
      if (!resbody) {
        res.status(200).json(balloons.makeTemplateErrorText("문제가 발생했습니다."));
      }
      else{
        console.log(`coinPriceCommand 응답 데이터 = ${JSON.stringify(resbody, null, 4)}`);
        res.status(200).json(resbody);
      }
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

async function _parseItemCardBalloon(coinData) {

  /*
    price: ticker.lastPrice,
    volume: ticker.volume,
    high: ticker.highPrice,
    low: ticker.lowPrice,
    change: ticker.priceChangePercent, // 변화율
    timestamp: Date.now()
    fixedTicker - 보여줄 티커 이름
    exchange - 정보를 가져온 거래소 이름
    */

  // 아이템 카드 말풍선을 만든다.
  if (!coinData) {
    return balloons.makeTemplateErrorText(`해당 코인의 이름은 등록되어 있지 않습니다.`);
  }

  if (!coinData.fixedTicker || !coinData.price || !coinData.change ||
     !coinData.high || !coinData.low || !coinData.volume ) {
    return balloons.makeTemplateErrorText('거래소 데이터에 문제가 발생했습니다.');
  }

  let itemCard = {
    "itemCard" : {}
  };


  // title, description - 용도 모름
  //itemCard.title = "";
  //itemCard.description = "";

  // thumbnail - 코인 아이콘 대표 이미지
  /*
  try {
    itemCard.thumbnail = {};
    
    itemCard.thumbnail.imageUrl = await icons.getLogoUrl(coinData.fixedTicker); //`https://imgcdn.stablediffusionweb.com/2024/4/30/2f52f66a-84ac-451b-bb06-b7fc087e6c84.jpg`;
    itemCard.thumbnail.width = 800;
    itemCard.thumbnail.height = 400;
  } catch (error) {
    console.error(error.message);
  }
  */

  // profile - 최상단 (아이콘 + 티커이름)
  itemCard.profile = {};
  itemCard.profile.title = coinData.fixedTicker;
  itemCard.profile.imageUrl = await icons.getLogoUrl(coinData.fixedTicker);

  // imageTitle
  itemCard.imageTitle = {};
  if (coinData.exchange === `upbit`) {
    itemCard.imageTitle.title = `UPBIT`; 
    itemCard.imageTitle.description = `업비트 시세 정보입니다`; 
  }
  else if (coinData.exchange === `binance`) {
    itemCard.imageTitle.title = `BINANCE`; 
    itemCard.imageTitle.description = `바이낸스에 시세 정보입니다`; 
  }
  else if (coinData.exchange === `bithumb`) {
    itemCard.imageTitle.title = `BITHUMB`; 
    itemCard.imageTitle.description = `빗썸에 시세 정보입니다`; 
  }

  // itemList - 본문에 들어갈 키 - 값 내용  < 말풍선 필수!! 값 >
  itemCard.itemList = [];

  // 변동율
  if (coinData.change > 0) {
    let fluctate = util.nameWithCommas(coinData.change);
    fluctate ='🔺' + fluctate + `%`;

    itemCard.itemList.push({ title: `변동`, description: fluctate });
  }
  else {
    let fluctate = util.nameWithCommas(coinData.change);
    fluctate ='💧' + fluctate + `%`;

    itemCard.itemList.push({ title: `변동`, description: fluctate });
  }
  // 고가, 저가
  if (coinData.high > 0 && coinData.low > 0)
  {
    if (coinData.exchange === `binance`){
      itemCard.itemList.push({ title: `고가`, description : `$` + util.nameWithCommas(coinData.high) });
      itemCard.itemList.push({ title: `저가`, description : `$` + util.nameWithCommas(coinData.low) });
    }
    else {
      itemCard.itemList.push({ title: `고가`, description : util.nameWithCommas(coinData.high) + `원` });
      itemCard.itemList.push({ title: `저가`, description : util.nameWithCommas(coinData.low) + `원`});
    }
  }
  // 거래량
  if (coinData.volume > 0) {
    itemCard.itemList.push({ title: `거래량`, description: util.nameWithCommas(coinData.volume) + ` (${coinData.fixedTicker})` });
  }

  // 좌우 정렬
  itemCard.itemListAlignment = "right";

  // 강조 텍스트
  itemCard.itemListSummary = {};
  itemCard.itemListSummary.title = "현재가";
  if (coinData.exchange === `binance`) {
    itemCard.itemListSummary.description ="$" + util.nameWithCommas(coinData.price);
  }
  else {
    itemCard.itemListSummary.description = util.nameWithCommas(coinData.price) + "원"
  }

  // 결과
  let balloon = balloons.balloonResponseWrapper();
  balloon.template.outputs.push({itemCard});

  log(`완성된 말풍선 데이터 ${JSON.stringify(balloon, null, 4)}`);
  //console.log(`완성된 말풍선 데이터 ${JSON.stringify(balloon, null, 4)}`);

  return balloon;
}

// Function to get the current price of a specific ticker
function getTickerPrice(ticker) {
    if (wsBinance.binanceTickerData[ticker]) {
        return wsBinance.binanceTickerData[ticker].price;
    } else {
        console.log(`Ticker ${ticker} not found or no data available.`);
        return null;
    }
}

// Function to convert a coin name to its ticker symbol
function getTickerFromBinance(englishCoinName) {
    const tickerUSDT = wsBinance.englisthCoinNameToTickerMap[englishCoinName];
    
    // englishCoinName : tikerUSDT
    // ㄴ-> ex) PEPE: 'PEPEUSDT', 

    if (tickerUSDT) {
        return englishCoinName;
    } else {
        console.log(`Coin name ${englishCoinName} not found in mapping.`);
        return null;
    }
}

function getTickerFromUpbit(koreanCoinName_or_krwTicker) {
    const pureTicker = wsUpbit.findUpbitPureTicker(koreanCoinName_or_krwTicker);
    if (pureTicker) {
        return pureTicker;
    } else {
        //console.log(`Korean coin name ${koreanCoinName_or_krwTicker} not found in mapping.`);
        return null;
    }
}

// Function to get the current price by any identifier (Korean name, English name, or ticker)
function getPriceByIdentifier(identifier) {
    var price = 0;

    const ticker = getTickerFromUpbit(identifier);
    if (ticker && wsUpbit.upbitTickerData[ticker])
    {
        // upbit
        price = wsUpbit.upbitTickerData[ticker].price;
        console.log(`${identifier} 가격은 ${price} KRW 입니다`);
        return price;
    }
    else if (wsBinance.binanceTickerData[identifier])
    {
        // binance
        price = wsBinance.binanceTickerData[identifier].price;
        console.log(`${identifier} 가격은 ${price} USDT 입니다`);
        return price;
    }

    console.log(`Identifier ${identifier} could not be resolved to a ticker or no data available.`);
    return null;
}

function getTickerByIdentifier(identifier) {
    var price = 0;

    const ticker = getTickerFromUpbit(identifier);
    if (ticker && wsUpbit.upbitTickerData[ticker])
    {
        // upbit
        return ticker;
    }
    else if (wsBinance.binanceTickerData[identifier])
    {
        // binance
        return identifier;
    }

    return null;
}

function getSearchCoinData(identifier) {

    let coinData =  null;

    const ticker = getTickerFromUpbit(identifier);
    if (ticker && wsUpbit.upbitTickerData[ticker])
    {
        coinData = wsUpbit.upbitTickerData[ticker];
    }
    else if (wsBinance.binanceTickerData[identifier])
    {
        coinData = wsBinance.binanceTickerData[identifier];
    }

    if (!coinData){
      return null;
    }
      
    /*
    price: ticker.lastPrice,
    volume: ticker.volume,
    high: ticker.highPrice,
    low: ticker.lowPrice,
    change: ticker.priceChangePercent, // 변화율
    timestamp: Date.now()
    */
     console.log(`검색한 코인이름: ${coinData.fixedTicker}, 거래소: ${coinData.exchange}`);

    return coinData;
}

module.exports = { initExchangeData, coinPriceCommand, getTickerPrice, getTickerFromBinance, getTickerFromUpbit, getPriceByIdentifier };