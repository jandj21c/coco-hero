var util              = require('../../util');
const coinPricePoll   = require('../../coinPricePolling');
const db              = require('../../models/index');
const balloons        = require('../../balloons/templateBalloons');
const addPriceBalloons = require('../../balloons/addPriceBalloons');

const coinPriceInfo   = require('../searchPrice/coinPrice');
const intervalSetting = require('./setPriceNotiInterval');

let PriceTimerModel = new db.Timer;

const maxPriceNotifyCount = 10;

// todo
// 코인을 알림db에 등록하고 사용자에게 등록여부, 알림간격을 알려준다
// 없는 코인이라 등록에 실패할 경우 메이저 코인리스트를 알려준다
// 이미 등록되어있는 경우 알려준다.
// 알림은 최대 10개까지 임을 알려준다.

var addPriceNotifyCommand = async function(req, res) {

  console.log('-------- [Bot Command] [addPriceNotify] chat bot server request -------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('-------- [addPriceNotify] chat bot server request end ----------------');

  const userId = req.body.userRequest.user.id;
  console.log(`${userId}의 알림등록 요청`);

  //var user = await userModel.getUserByID(userId);

  var hasCoinCode = req.body.action.detailParams.hasOwnProperty('regAlimCoinCode');
  var hasCoinName = req.body.action.detailParams.hasOwnProperty('regAlimCoinName');

  if( hasCoinCode == false && hasCoinName == false ) {
    console.log('가격알림등록 - 파라미터 누락 오류');

    var resBalloon = balloons.makeTemplateErrorText('코인명이 누락되었습니다');
    res.status(200).json(resBalloon);
    return;
  }

  var regCoinName = "";
  var regCoinCode = "";

  if( hasCoinName ) {
      regCoinName = req.body.action.detailParams.regAlimCoinName.origin;
  }

  if( hasCoinCode ) {
      regCoinCode = req.body.action.detailParams.regAlimCoinCode.origin;
  }

  console.log(`regCoinCode : ${regCoinCode} regCoinName : ${regCoinName}` );

  regCoinName = regCoinName.trim();

  if( util.isEmpty(regCoinName) == false) {
      // 코드명으로 파싱
      regCoinCode = coinPriceInfo.parseCoinCode(regCoinName);
  }
  else {
      regCoinCode = regCoinCode.trim().toLowerCase();
  }

  //console.log(`등록시도하려는 코인이름 : ${regCoinCode}`);

  const majorCoin = coinPricePoll.majorCoinArray;

  var hasArray = false;
  for(var i = 0; i < majorCoin.length ; i++) {
     if( majorCoin[i] == regCoinCode ){
       hasArray = true;
       break;
     }
  }

  if( !hasArray) {
    //console.log("메이저 리스트에 없는 코인");

    // 없는 코인이라 등록에 실패할 경우 메이저 코인리스트를 알려준다
    var resBalloon = balloons.makeTemplateBCard_DoBlock("시세알림 등록실패", "시세알림을 제공하지 않는 코인입니다. \ 시세가 제공되는 코인리스트를 확인하시려면 아래 버튼을 눌러주세요", "코인리스트", "5c922e0305aaa72598db5da4");
    resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림등록", "5c944e1205aaa72598db6508" );

    res.status(200).json(resBalloon);
    return;
  }

  var timeInterval = intervalSetting.defaultTimeInterval;
  var arrayCoin = [];

  var timer = await PriceTimerModel.getTimerByID(userId);

  if( util.isEmpty(timer) == false ) {

      timeInterval = timer.interval; // 유저의 세팅된 타임인터벌을 알려주는 용도

      if( util.isEmpty(timer.coinlist) == false ) {
        // 기존에 등록된 알림 받는 코인이 1개 이상 있다.
        arrayCoin = timer.coinlist.split(',');

        if( arrayCoin.length >= maxPriceNotifyCount) {

            //console.log("알림 등록 허용 갯수 초과");
            var resBalloon = balloons.makeTemplateErrorText('최대 알림 등록 갯수를 초과 하였습니다 \ 알림해제 후 추가 하실 수 있습니다.');
            resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림해제", "5c8dab575f38dd47672199b6" );
            resBalloon = balloons.addQuickReplyBlock(resBalloon, "My시세알림", "5ca0d6f65f38dd08cf0ee4fd" );
            resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림가능한 암호화폐 리스트", "5c922e0305aaa72598db5da4" );
            
            res.status(200).json(resBalloon);
            return;
        }

        var alreadyReg = false;
        // 이미 등록되어 있는지 확인
        for(var i = 0; i < arrayCoin.length ; i++) {
           if( arrayCoin[i] == regCoinCode ){
             alreadyReg = true;
             break;
           }
        }

        if( alreadyReg ) {
          //console.log("이미 등록된 코인");
          var resBalloon = balloons.makeTemplateErrorText(`${regCoinCode}는 이미 추가되어 있는 코인 입니다.`);
          resBalloon = balloons.addQuickReplyBlock(resBalloon, "My시세알림", "5ca0d6f65f38dd08cf0ee4fd" );
          resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림등록", "5c944e1205aaa72598db6508" );
          resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림가능한 암호화폐 리스트", "5c922e0305aaa72598db5da4" );
          
          res.status(200).json(resBalloon);
          return;
        }
      }

      //console.log("오류없음. 기유저 알림등록 수행");

      // 알림등록 수행
      await updatePriceTimer( userId, regCoinCode, timer, res);

  }
  else {

      //console.log("오류없음. 신규 유저 알림등록 수행");

      await initPriceTimer(userId, regCoinCode, res);
  }

  let newCoinListStr = "";

  if( arrayCoin.length > 0) {
      // 유저의 알림 코인리스트
      newCoinListStr = arrayCoin.concat(regCoinCode).join(',');
  }
  else {
      newCoinListStr = regCoinCode;
  }

  //console.log("등록 완료");

  /* 대문자 변환 */
  const upperRegCoinCode = regCoinCode.toUpperCase();
  const upperCoinList = newCoinListStr.toUpperCase();


  var intervalStr = intervalSetting.parseIntervalToString(timeInterval);

  var descText = `* ${upperRegCoinCode} 코인이 시세알림에 추가되었습니다
* 등록된 코인 리스트
  ${upperCoinList}
* 알림 간격 : ${intervalStr}`;

  var resBalloon = addPriceBalloons.makeUserNotiInfo("시세알림 등록완료", descText);
  //var resBalloon = balloons.templateBCard_DoBlock(`${upperRegCoinCode} 알림 등록`, `시세알림이 정상적으로 등록되었습니다. \ 설정된 알림 간격은 ${timeInterval} 입니다.`, )
  //var resBalloon = balloons.makeTemplateErrorText(`${upperRegCoinCode}의 시세알림이 정상적으로 등록되었습니다.`);
  //console.log(JSON.stringify(resBalloon, null, 4));
  res.status(200).json(resBalloon);
}


var updatePriceTimer = async function( userId, coinCode, timer, res) {

    var newCoinListStr = "";

    if( timer.coinlist.length > 0) {
      console.log("이미하나 있다?");

      var arrayCoin = timer.coinlist.split(','); // string 을 ','로 분리하여 array로 만들어준다. 비어있어도 split 쓰면 하나 있다고 나옴
      newCoinListStr = arrayCoin.concat(coinCode).join(',');
    }
    else {
      console.log("없다");

      newCoinListStr = coinCode;
    }

    var timerForm = {};

      timerForm.botuserid = userId;
      timerForm.interval = timer.interval;
      timerForm.coinlist = newCoinListStr;
      console.log(`변경된 코인리스트- ${timerForm.coinlist}`);
      timerForm.publickey = "";

    await PriceTimerModel.addorUpdate( timerForm );

}

var initPriceTimer = async function( userId, coinCode, res) {

    var timerForm = {};

      timerForm.botuserid = userId;
      timerForm.interval = intervalSetting.defaultTimeInterval;
      timerForm.coinlist = coinCode;
      console.log(`새로운 코인리스트- ${timerForm.coinlist}`);
      timerForm.publickey = "";

    await PriceTimerModel.addorUpdate( timerForm );

}

module.exports.addPriceNotifyCommand = addPriceNotifyCommand;
