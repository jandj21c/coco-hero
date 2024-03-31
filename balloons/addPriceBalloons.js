
// myPriceNotify 와 addPriceNotify 에서 사용 
var makeUserNotiInfo = function(title, desc)  {

      var userNotiInfo = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                  "basicCard": {
                    "thumbnail": {
                      "imageUrl": "https://miro.medium.com/max/976/1*c3cQvYJrVezv_Az0CoDcbA.jpeg" // 알림 종모양
                    },
                    "title": "", // 수정필요
                    "description": "" //수정필요
                  }
                } 
            ],
          "quickReplies": [
              {
                "label":"알림추가",
                "messageText":"알림추가",
                "action":"block",
                "blockId":"5c944e1205aaa72598db6508" // 시세알림 등록
              },
              {
                "label":"알림간격설정",
                "messageText":"알림간격설정",
                "action":"block",
                "blockId":"5c8dac50e821276402ffeae6" // 시세알림 간격 블록
              },
              {
                "label":"알림해제",
                "messageText":"알림해제",
                "action":"block",
                "blockId":"5c8dab575f38dd47672199b6" // 알림해제 블록
              }
          ]
        }
    };

    
    userNotiInfo.template.outputs[0].basicCard.title = title;
    userNotiInfo.template.outputs[0].basicCard.description = desc;

    return userNotiInfo;
}

module.exports.makeUserNotiInfo = makeUserNotiInfo;

