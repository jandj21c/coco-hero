module.exports = {

    server_port : process.env.PORT || 3000,
  
    route_info : [
      // route_info 에서 쓸 정보라서 파일은 routes 폴더를 기준으로 되어있다.

    //   { file : './searchPrice/coinPrice', path : '/api/coinPrice', method : 'coinPriceCommand' , type : 'post'},
    //   { file : './searchPrice/myCoinPrice', path : '/api/myCoinPrice', method : 'myCoinPriceCommand' , type : 'post'},
  
    //   { file : './rippleWallet/checkRippleWallet', path : '/api/checkRippleWallet', method : 'checkRippleWalletCommand' , type : 'post'},
    //   { file : './rippleWallet/createRippleWallet', path : '/api/createRippleWallet', method : 'createRippleWalletCommand' , type : 'post'},
    //   { file : './rippleWallet/xrpBalance', path : '/api/xrpBalance', method : 'xrpBalanceCommand' , type : 'post'},
    //   { file : './rippleWallet/xrpSend', path : '/api/xrpSend', method : 'xrpSendCommand' , type : 'post'},
    //   { file : './rippleWallet/xrpWithdrawal', path : '/api/xrpWithdrawal', method : 'xrpWithdrawalCommand' , type : 'post'},
    //   { file : './rippleWallet/onEventSend', path : '/api/onEventSend', method : 'onEventSendCommand' , type : 'post'},
    //   { file : './rippleWallet/createRippleWallet', path : '/api/removeWalletFire', method : 'removeWalletFireCommand' , type : 'post'},
      
    //   { file : './priceNotify/addPriceNotify', path : '/api/addPriceNotify', method : 'addPriceNotifyCommand' , type : 'post'},
    //   { file : './priceNotify/myPriceNotify', path : '/api/myPriceNotify', method : 'myPriceNotifyCommand' , type : 'post'},
    //   { file : './priceNotify/removePriceNotify', path : '/api/removePriceNotify', method : 'removePriceNotifyCommand' , type : 'post'},
    //   { file : './priceNotify/setPriceNotiInterval', path : '/api/setPriceNotiInterval', method : 'setPriceNotiIntervalCommand' , type : 'post'},
    //   { file : './priceNotify/onEventPrice', path : '/api/onEventPrice', method : 'onEventPriceCommand' , type : 'post'},
    //   { file : './priceNotify/onEventPrice', path : '/api/onEventRemoveWallet', method : 'onRemoveWalletCommand' , type : 'post'},
  
      { file : './ping', path : '/api/getHello', method : 'testGet' , type : 'get'}, // 챗봇서버는 GET 지원안함, 전부 POST
      { file : './ping', path : '/api/sayHello', method : 'testPost1' , type : 'post'},
      { file : './ping', path : '/api/showHello', method : 'testPost2' , type : 'post'}, //https://coco-chatbot-b62f09b55eb9.herokuapp.com/api/marketmood

      // 시황
      { file : './market/mood', path : '/api/marketMood', method : 'marketMoodCommand' , type : 'post'},

      // 가격
      { file : './market/wsPrice', path : '/api/coinPrice', method : 'coinPriceCommand' , type : 'post'}
    ]
  }