//var util              = require('../../util');
//const coinPricePoll   = require('../../coinPricePolling');
//const db              = require('../../models/index');
const balloons        = require('../../balloons/templateBalloons');
//const addPriceBalloons = require('../../balloons/addPriceBalloons');

//const coinPriceInfo   = require('../searchPrice/coinPrice');

var marketMoodList = ["비트코인 가격","현재 급등 코인","현재 급락 코인" ,"공포탐욕지수","새로 상장한 코인","최근 주목받고 있는 코인","시가총액 순위","김치프리미엄","오늘의 코인뉴스","에어드랍 이벤트"];


var marketMoodCommand = async function(req, res) {

  console.log('-------- [Bot Command] [marketMoodCommand 시황] requested -------');
  //console.log(JSON.stringify(req.body, null, 4));

  // const userId = req.body.userRequest.user.id;
  // console.log(`${userId}의 marketMoodCommand 요청`);

  let resCarousel = balloons.makeTemplateCarousel();

  var item = {};
  marketMoodList.forEach((categori) => {
    item = makeMarketMoodCardBalloons(categori);
    resCarousel.template.outputs[0].carousel.items.push(item);
  });
  
  //resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림등록", "5c944e1205aaa72598db6508" );

  console.log('-------- [Bot Command] [marketMoodCommand 시황] responsed -------');
  res.status(200).json(resCarousel);
  return;
}

// 시황 카테고리 카드형 아이템
function makeMarketMoodCardBalloons(categori) {

  var title  = makeCarouselTitle(categori);
  var desc   = makeCarouselDescription(categori);
  var imgUrl = makeCarouselImageUrl(categori);

  let carouselItem = balloons.makeTemplateCarouselItem(title, desc, imgUrl);
  return carouselItem;
}


function makeCarouselTitle(categori) {

  var upperCoinName = categori.toUpperCase();

  return `${upperCoinName} 정보`;
}

function makeCarouselDescription(categori) {

//    var bithumb = exchangeList['bithumb'].coinList[coinCode];
//    var upbit = exchangeList['upbit'].coinList[coinCode];

//    var bithumbPrice = makePriceText(bithumb.currentPrice);
//    var bithumbFluctate = makefluctuationText(bithumb.fluctate_rate_24);

//    var upbitPrice =  makePriceText(upbit.currentPrice);
//    var upbitFluctate = makefluctuationText(upbit.fluctate_rate_24);

//     var description = `
// 빗썸   : ${bithumbPrice} (${bithumbFluctate})
// 업비트: ${upbitPrice} (${upbitFluctate})`;

//⭐알림주기 - ${intervalStr}마다🎵 -> 캐로셀은 두줄까지만 가능 ㅠㅠ

  var description = `${categori} 설명입니다`;

  return description;
}

function makeCarouselImageUrl(categori) {

  return 'http://www.coinreaders.com/imgdata/coinreaders_com/201807/2018072621491047.png';

  switch (categori) {
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



module.exports.marketMoodCommand = marketMoodCommand;
