var util            = require('../../util');
const db            = require('../../models/index');
const balloons      = require('../../balloons/templateBalloons');

let PriceTimerModel = new db.Timer;

var removePriceNotifyCommand = async function(req, res) {

  console.log('-------- [Bot Command] [removePriceNotify] chat bot server request -------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('-------- [removePriceNotify] chat bot server request end ----------------');

  const userId = req.body.userRequest.user.id;
  console.log(`${userId}의 모든 알림을 해제한다`);

    var hasInterval = req.body.action.detailParams.hasOwnProperty('removePriceNoti');
  // 체크할 필요있나

  var timer = await PriceTimerModel.getTimerByID(userId);

  if( util.isEmpty(timer) == false ) {

      await PriceTimerModel.removeCoinListByID( userId );

      let resBalloon = balloons.makeTemplateBCardXButton(`시세알림 해제`, `모든 시세 알림이 해제 되었습니다.`);
      res.status(200).json(resBalloon);

  }
  else {

      let resBalloon = balloons.makeTemplateBCardXButton(`시세알림 해제`, `등록된 시세알림이 없습니다.`);
      res.status(200).json(resBalloon);

  }
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


module.exports.removePriceNotifyCommand = removePriceNotifyCommand;
