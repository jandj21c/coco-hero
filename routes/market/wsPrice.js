var wsBinance = require('../../exchange/wsBinance');
var wsUpbit = require('../../exchange/wsUpbit');
var icons = require('./icons');
var balloons = require('../../balloons/templateBalloons');
var util     = require('../../util');

// 외부에서 호출하는 엔트리
async function initExchangeData() {

    console.log('initialize exchange polling. 거래소 폴링 시작. 20초 마다 업데이트');

    await icons.InitCoinIconList();
    await wsBinance.startFetchingTickerData();
    await wsUpbit.startFetchingTickerData();

    //_parseItemCardBalloon(getSearchCoinData("비트코인")); //test:
}

async function coinPriceCommand(req, res) {

  console.log('-------------- coinPriceCommand req COMMING ----------------');
  //console.log('----------- coinPriceCommand chat bot server request body -------------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('----------- coinPriceCommand chat bot server request end -----------');

  console.log(JSON.stringify(req.body, null, 4));
  
  let coinName;

  if ( req.body && req.body.userRequest.utterance && req.body.userRequest.utterance.trim()) {

    // "/p {코인이름}"" 이 들어왔을 거라 생각하고 앞의 /p 를 제거, 남은 문자의 앞공백 제거, 대문자로 변경 
    coinName = req.body.userRequest.utterance.trim().substr(2).trim().toUpperCase();
    
    console.log(JSON.stringify(`사용자가 요청한 가격 블록의 대화 전문: ${coinName}`));

    // [그룹챗봇] 사용자 대화는 "!가격 XXX" 라고 들어왔을거라 가정하고 !가격 뒤를 자름
    // userWantCoin = utter.substr(3).trim();
    // console.log(JSON.stringify(`사용자가 요청한  코인 가격 정보 : ${userWantCoin}`));
  }
  else {
    res.status(200).json(balloons.makeTemplateErrorText("코인 가격 검색 요청이 올바르지 않습니다."));
    return;
  }

  // 거래소에서 가져온 코인 정보로 말풍선을 만든다
  _parseItemCardBalloon(getSearchCoinData(coinName))
    .then(resbody => {
      console.log(`coinPriceCommand 응답 데이터 = ${JSON.stringify(resbody, null, 4)}`);
      res.status(200).json(resbody);
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


  if (!coinData)
    return balloons.makeTemplateErrorText('검색 리스트에 없는 코인입니다');

  let itemCard = {
    "itemCard" : {}
  };

  // imageTitle
  itemCard.imageTitle = {};

  itemCard.imageTitle.title = coinData.fixedTicker;
  if (coinData.exchange === `upbit`) {
    itemCard.imageTitle.description = `업비트에 등록된 티커입니다`; 
  }
  else if (coinData.exchange === `binance`) {
    itemCard.imageTitle.description = `바이낸스에 등록된 티커입니다`; 
  }
  else if (coinData.exchange === `bithumb`) {
    itemCard.imageTitle.description = `빗썸에 등록된 티커입니다`; 
  }

  // title, description - 용도 모름
  //itemCard.title = "";
  //itemCard.description = "";

  // thumbnail - 대표 이미지
  itemCard.thumbnail = {};
  itemCard.thumbnail.imageUrl = `https://imgcdn.stablediffusionweb.com/2024/4/30/2f52f66a-84ac-451b-bb06-b7fc087e6c84.jpg`;//await icons.getCoinIconUrl(coinData.fixedTicker); // coin gecko 에서 가져온 url 
  itemCard.thumbnail.width = 800;
  itemCard.thumbnail.height = 400;

  // profile
  itemCard.profile = {};

  if (coinData.exchange === `upbit`) {
    itemCard.profile.title = `UPBIT`;
    itemCard.profile.imageUrl = balloons.exchangeIocn_upbit;
  }
  else if (coinData.exchange === `binance`) {
    itemCard.profile.title = `BINANCE`;
    itemCard.profile.description = balloons.exchangeIocn_binance;
  }
  else if (coinData.exchange === `bithumb`) {
    itemCard.profile.title = `BITHUMB`;
    itemCard.profile.description = balloons.exchangeIocn_bithumb;
  }

  // itemList - 본문에 들어갈 키 - 값 내용
  itemCard.itemList = [];
  // 가격
  if (coinData.price > 0){
    if (coinData.exchange === `binance`){
      itemCard.itemList.push({ title: "현재 가격", description: `$` + util.nameWithCommas(coinData.price)});
    }
    else{
      itemCard.itemList.push({ title: "현재 가격", description: util.nameWithCommas(coinData.price) + "원"});
    }
  }

  // 변동율
  if (coinData.change > 0) {
    let fluctate = util.nameWithCommas(coinData.change);
    fluctate ='🔺(상승)' +fluctate;

    itemCard.itemList.push({ title: `변동%`, description: fluctate });
  }
  else {
    let fluctate = util.nameWithCommas(coinData.change);
    fluctate ='💧(하락)' +fluctate;

    itemCard.itemList.push({ title: `변동%`, description: fluctate });
  }
  
  // 고가, 저가
  if (coinData.high > 0 && coinData.low > 0) {
    itemCard.itemList.push({ title: `고가`, description : util.nameWithCommas(coinData.high) });
    itemCard.itemList.push({ title: `저가`, description : util.nameWithCommas(coinData.low) });
  }

  // 거래량
  if (coinData.volume > 0){
    itemCard.itemList.push({ title: `거래량`, description: coinData.volume });
  }

  let balloon = balloons.balloonResponseWrapper;
  balloon.template.outputs.push({itemCard});

  // 완성된 말풍선 데이터를 리턴한다. 
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
        console.log(`Korean coin name ${koreanCoinName_or_krwTicker} not found in mapping.`);
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
     console.log(`검색한 코인이름 : ${coinData.fixedTicker}, 거래소 " ${coinData.exchange}`);

    return coinData;
}

module.exports = { initExchangeData, coinPriceCommand, getTickerPrice, getTickerFromBinance, getTickerFromUpbit, getPriceByIdentifier };