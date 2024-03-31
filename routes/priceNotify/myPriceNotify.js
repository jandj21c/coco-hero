var util              = require('../../util');
const db              = require('../../models/index');
const balloons        = require('../../balloons/templateBalloons');
const addPriceBalloons = require('../../balloons/addPriceBalloons');

const intervalSetting = require('./setPriceNotiInterval');

let PriceTimerModel = new db.Timer;

//나의알림세팅
//input myPriceNotify

var myPriceNotifyCommand = async function(req, res) {

  console.log('-------- [Bot Command] [myPriceNotify] chat bot server request -------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('-------- [myPriceNotify] chat bot server request end ----------------');

  const userId = req.body.userRequest.user.id;

  console.log(`${userId}의 나의알림세팅 요청`);

  var hasMyPriceNotify = req.body.action.detailParams.hasOwnProperty('myPriceNotify');

  if( hasMyPriceNotify == false) {
    console.log('이상한 요청');

    var resBalloon = balloons.makeTemplateErrorText('올바른 요청이 아닙니다');
    res.status(200).json(resBalloon);
    return;
  }

  var timeInterval = intervalSetting.defaultTimeInterval;

  // 사용자의 정보를 가져온다

  var timer = await PriceTimerModel.getTimerByID(userId);

  if( util.isEmpty(timer) == false ) {

        timeInterval = timer.interval;

        let strCoinList = "";

        if( util.isEmpty(timer.coinlist) ) {

            // 기존에 등록된 알림 받는 코인이 1개 이상 있다.
            strCoinList = `* 아직 알림이 등록된 코인이 없습니다.`;
        }
        else {
          
            // 등록된 코인의 리스트를 문자열로 변환
            var arrayCoin = timer.coinlist.split(','); //배열화
            var upperArrayCoin = arrayCoin.join(',').toUpperCase(); //문자열화

            strCoinList = `* 등록된 코인 리스트
  ${upperArrayCoin}`;
  
        }

        var intervalStr = intervalSetting.parseIntervalToString(timeInterval);

        var descText = `${strCoinList}
* 알림 간격 : ${intervalStr}`;

        var resBalloon = addPriceBalloons.makeUserNotiInfo("나의 시세알림 설정", descText);
        res.status(200).json(resBalloon);
  }
  else {

        var resBalloon = balloons.makeTemplateErrorText('등록된 시세알림이 없습니다. 알림을 등록해 보세요');
        resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림등록", "5c944e1205aaa72598db6508" );
        resBalloon = balloons.addQuickReplyBlock(resBalloon, "알림가능한 암호화폐 리스트", "5c922e0305aaa72598db5da4" );
        
        res.status(200).json(resBalloon);
      
  }
}


module.exports.myPriceNotifyCommand = myPriceNotifyCommand;

