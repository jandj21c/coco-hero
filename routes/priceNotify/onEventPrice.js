
// manuall
/* addPriceNotify 에서 알림등록 -> priceNotifier 에서 id list 선택 -> eventPrice -> [chatbotserver] -> onEventPrice */
// 자주 불리는 command 이니 최대한 로그 남기지 말자 !!

const myCoinPrice       = require('../searchPrice/myCoinPrice');
const templateBalloons  = require('../../balloons/templateBalloons');
const walletBalloons = require('../../balloons/rippleWalletInfo');

var onEventPriceCommand = async function(req, res) {

    console.log('-------- [Bot Command] [onEventPrice] chat bot server request -------');
    //console.log(JSON.stringify(req.body, null, 4));
    //console.log('-------- [onEventPrice] chat bot server request end ----------------');


    //"checkThisEventPriceNotification": "priceNotification"
    //let message = req.body.userRequest.params.checkThisEvent.origin;

    var hasEventName = req.body.userRequest.params.hasOwnProperty('checkThisEventPrice');
    if( !hasEventName ) {

        console.log('이벤트 input 에러. 잘못된 파라미터');

        templateBalloons.makeTemplateBCardXButton("시세알림오류", "시세 정보 요청에 실패하였습니다.");

        res.status(200).json(templateBalloons);
        return;
    }

    const userId = req.body.userRequest.user.id;

    await myCoinPrice.getMyCoinPrice(userId, res);
    return;
  }

  
let onRemoveWalletCommand = async function(req, res) {

  console.log('----------- [Bot Command] [onRemoveWalletCommand] chat bot server request -------------');
  //console.log(JSON.stringify(req.body, null, 4));
  //console.log('----------- [checkRippleWallet] chat bot server request end -----------');

  var responseBody = {};

  let userId = req.body.userRequest.user.id;
  if( userId != null ) {

      console.log(`${userId} 지갑기능 삭제를 알린다`);
      responseBody = walletBalloons.removeWalletBalloon;
    }

    //console.log(JSON.stringify(responseBody, null, 4));
    res.status(200).json(responseBody);
    return;
  }

module.exports.onEventPriceCommand = onEventPriceCommand;
module.exports.onRemoveWalletCommand = onRemoveWalletCommand;
