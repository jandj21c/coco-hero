
// 내가 알림등록한 코인의 시세를 원터치로 보여준다.

const util              = require('../../util');
const db                = require('../../models/index');
const templateBalloons  = require('../../balloons/templateBalloons');
const coinPriceInfo     = require('../../coinPricePolling');
const intervalSetting   = require('../priceNotify/setPriceNotiInterval');

let PriceTimerModel = new db.Timer;
let exchangeList = coinPriceInfo.exchangeList;


var myCoinPriceCommand = async function(req, res) {

    console.log('-------- [Bot Command] [myCoinPrice] chat bot server request -------');
    //console.log(JSON.stringify(req.body, null, 4));
    //console.log('-------- [myCoinPrice] chat bot server request end ----------------');

    var hasMyCoinPrice = req.body.action.detailParams.hasOwnProperty('myCoinPrice');
    if( !hasMyCoinPrice ) {

        console.log('이벤트 input 에러. 잘못된 파라미터');

        templateBalloons.makeTemplateBCardXButton("시세검색오류", "내가 등록한 코인의 시세 정보 요청에 실패하였습니다.");

        res.status(200).json(templateBalloons);
        return;
    }

    const userId = req.body.userRequest.user.id;

    await getMyCoinPrice(userId, res);
    return;
}

var getMyCoinPrice = async function(userId, res) {

    try{

      console.log('getMyCoinPrice.');
      let resCarousel = templateBalloons.makeTemplateCarousel();

      const timer = await PriceTimerModel.getTimerByID(userId);
      if ( timer.coinlist.length > 0 ) {

          var arrayCoin = timer.coinlist.split(','); // string 을 ','로 분리하여 array로 만들어준다. 비어있어도 split 쓰면 하나 있다고 나옴

          var item = {};
          arrayCoin.forEach((coin) => {
              //console.log(`코인: ${coin}`);
              item = makeCoinPriceCarouselItem(coin, timer.interval);
              resCarousel.template.outputs[0].carousel.items.push(item);
          });

          //console.log(JSON.stringify(resCarousel, null, 4));
          res.status(200).json(resCarousel);
          return;
      }
      else {

        var resBalloon = templateBalloons.makeTemplateBCardXButton("시세알림오류", "등록된 코인 리스트가 없습니다.");
        res.status(200).json(resBalloon);
        return;

      }
    }
    catch (e) {
      console.log('getMyCoinPrice 에러.');
      console.log(`${e.message}`);

      var resBalloon = templateBalloons.makeTemplateBCardXButton("시세알림오류", "코인리스트 오류 입니다.");
      res.status(200).json(resBalloon);
      return;
    }
}

//코인별 시세를 가져와 캐러셀 아이템을 만든다.
 function makeCoinPriceCarouselItem(coin, interval) {

    var title  = makeCarouselTitle(coin, interval);
    var desc   = makeCarouselDescription(coin);
    var imgUrl = makeCarouselImageUrl(coin);

    let carouselItem = templateBalloons.makeTemplateCarouselItem(title, desc, imgUrl);
    return carouselItem;
 }

 function makeCarouselTitle(coinCode, interval) {

   var upperCoinName = coinCode.toUpperCase();

   var intervalStr = intervalSetting.parseIntervalToString(interval);

   return `${upperCoinName} 시세정보`;
 }

 function makeCarouselDescription(coinCode) {

    var bithumb = exchangeList['bithumb'].coinList[coinCode];
    var upbit = exchangeList['upbit'].coinList[coinCode];
    //exchangeList['binance'].coinList[coinCode]);

    var bithumbPrice = makePriceText(bithumb.currentPrice);
    var bithumbFluctate = makefluctuationText(bithumb.fluctate_rate_24);

    var upbitPrice =  makePriceText(upbit.currentPrice);
    var upbitFluctate = makefluctuationText(upbit.fluctate_rate_24);

    //var intervalStr = intervalSetting.parseIntervalToString(interval);

 	  var description = `
빗썸   : ${bithumbPrice} (${bithumbFluctate})
업비트: ${upbitPrice} (${upbitFluctate})`;

//⭐알림주기 - ${intervalStr}마다🎵 -> 캐로셀은 두줄까지만 가능 ㅠㅠ

   return description;
 }

 function makePriceText(openPrice) {

     if( openPrice > 0 ) {
       openPrice = util.nameWithCommas(openPrice);
     }

     openPrice = openPrice+'원';

     return openPrice;
 }

 function makefluctuationText(fluctateRate) {

   if( fluctateRate > 0){
     fluctateRate = '🔺+' +fluctateRate;
   }
   else {
     fluctateRate = '💧' +fluctateRate;
   }

   return fluctateRate+'%';
 }

function makeCarouselImageUrl(coin) {

  switch (coin) {
    case 'btc':
    case 'bitcoin':
    case '비트코인':
    case '비코':
    case '비트':
      return 'http://www.coinreaders.com/imgdata/coinreaders_com/201807/2018072621491047.png';

    case 'xrp':
    case 'ripple':
    case '리플':
    case '리플코인':
      return 'https://cdn-images-1.medium.com/max/1600/1*pY6tlh2va-tn_17rXGQXkQ.jpeg'; //https://ethereumworldnews.com/wp-content/uploads/2018/11/XRP-Logo-.png

    case 'eth':
    case '이더리움':
    case '이더':
      return 'https://unhashed.com/wp-content/uploads/2018/01/Beginners-Guide-to-Ethereum.jpg';

    case 'ltc':
    case '라코':
    case '라이트코인':
    case '라이트':
      return'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKJauPbtx-VG_Fh_oMzHv3Nw_P1u5JqO5inv-LHc_O4mjXiRfI';

    case 'etc':
    case '이더리움클래식':
    case '이더리움 클래식':
    case '이클':
      return 'https://news.bitcoin.com/wp-content/uploads/2016/07/Ethereum-Hard-Fork-Gives-Birth-To-A-New-Chain.jpg';

    case 'bch':
    case '비코캐':
    case '비트코인캐시':
    case '비캐':
      return 'https://www.abitgreedy.com/wp-content/uploads/2018/02/bitcoincash-Logo.png';

    case 'xmr':
    case '모네로':
      return 'https://usethebitcoin.com/wp-content/uploads/2017/12/monerologo-e1536656145334-750x433.jpg';

    case 'qtum':
    case '퀀텀':
    case '큐텀':
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY5WZR6H3qWnwXlh2LaDb8FYpzEXYP5H6USF593WJaItjsi4YtiQ';

    case 'ada':
    case '에이다':
      return 'https://steemitimages.com/DQmWzkqQEvZn8cBdAsbJhZuc2RHWoDki8AifVvZpBosBK9E/2243102_1.jpg';

    case 'neo':
    case '네오':
      return 'https://i2.wp.com/todaysgazette.com/wp-content/uploads/2018/10/NEO.jpeg?resize=400%2C240&ssl=1';

    case 'eos':
    case '이오스':
      return 'https://s3.amazonaws.com/assets.disruptblock/wp-content/uploads/2018/04/13053237/eos-1024x536.jpg';

    case 'trx':
    case '트론':
      return 'https://ethereumworldnews.com/wp-content/uploads/2018/04/Tron-1.png';

    case 'xlm':
    case '스텔라':
    case '스텔라루멘':
      return 'https://bitcoinplay.net/wp-content/uploads/2018/09/Stellar%E2%80%99s-Jed-McCaleb-on-Digital-Payment-Competition.png';

    default:
      return 'https://cdn-images-1.medium.com/max/1600/1*pY6tlh2va-tn_17rXGQXkQ.jpeg'; //리플이 디폴트
  }
}


module.exports.myCoinPriceCommand = myCoinPriceCommand;
module.exports.getMyCoinPrice = getMyCoinPrice;
