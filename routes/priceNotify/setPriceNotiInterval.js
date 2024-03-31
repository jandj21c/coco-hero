var util            = require('../../util');
const db            = require('../../models/index');
const balloons      = require('../../balloons/templateBalloons');


const defaultTimeInterval = "180";

let PriceTimerModel = new db.Timer;

var setPriceNotiIntervalCommand = async function(req, res) {

  console.log('-------- [Bot Command] [setPriceNotiInterval] chat bot server request -------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('-------- [setPriceNotiInterval] chat bot server request end ----------------');

  const userId = req.body.userRequest.user.id;
  console.log(`${userId}의 알림 간격을 수정한다`);

  //var user = await userModel.getUserByID(userId);

  var hasInterval = req.body.action.detailParams.hasOwnProperty('setNotificationTime');

  if( hasInterval == false  ) {
    console.log('인터벌 누락 오류');

    var resBalloon = balloons.makeTemplateErrorText('알림 간격 정보가 누락 되었습니다.');
    res.status(200).json(resBalloon);
    return;
  }

  let intervalString = req.body.action.detailParams.setNotificationTime.origin;
  let intervalTime = parseStringToInterval(intervalString);

  console.log(`수정 요청된 알림 간격 : ${intervalTime}`);

  setInterval(userId, intervalTime);

  var resBalloon = balloons.makeTemplateBCardXButton(`시세알림간격 수정`, `알림간격은 [ ${intervalString} ] 으로 수정되었습니다.`);
  res.status(200).json(resBalloon);
}


var setInterval  = async function( userId, intervalTime) {

    var timer = await PriceTimerModel.getTimerByID(userId);

    if( util.isEmpty(timer) == false ) {

        timer.interval = intervalTime;

        await PriceTimerModel.addorUpdate( timer );

    }
    else {

      var timerForm = {};
        timerForm.botuserid = userId;
        timerForm.interval = intervalTime;
        timerForm.coinlist = "";
        timerForm.extra1 = "";

      await PriceTimerModel.addorUpdate( timerForm );
    }
}

var parseStringToInterval = function(str) {
    switch (str) {
      case '1분':
        return '1';

      case '10분':
        return '10';

      case '30분':
        return '30';

      case '1시간':
        return '60';

      case '3시간':
        return '180';

      case '6시간':
        return '360';

      case '오전9시':
        return '1440';

      default:
        return '60';
    }
}

var parseIntervalToString = function(interval) {
    switch (interval) {
      case '1':
        return '1분';

      case '10':
        return '10분';

      case '30':
        return '30분';

      case '60':
        return '1시간';

      case '180':
        return '3시간';

      case '360':
        return '6시간';

      case '1440':
        return '오전9시';

      default:
        return 'unknown';
    }
}

module.exports.defaultTimeInterval = defaultTimeInterval;
module.exports.setPriceNotiIntervalCommand = setPriceNotiIntervalCommand;
module.exports.parseStringToInterval = parseStringToInterval;
module.exports.parseIntervalToString = parseIntervalToString;
