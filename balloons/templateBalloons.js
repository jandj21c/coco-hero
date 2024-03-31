









/* ----------------------------------------------------------------------------*/


var makeTemplateErrorText = function(text)  {

      var templateErrorText = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": "요청에 실패하였습니다."
                    }
                }
            ]
        }
    };

    templateErrorText.template.outputs[0].simpleText.text = text;
    return templateErrorText;
}



var makeTemplateBCard_DoBlock = function(title, desc, label, blockId)  {

    var templateBCard_DoBlock = {
      "version": "2.0",
      "template": {
        "outputs": [
          {
            "basicCard": {
              "title": "",
              "description": "",
              "buttons": [
                {
                  "label": "",
                  "action": "block",
                  "blockId": ""
                }
              ]
            }
          }
        ]
      }
    };
    
    templateBCard_DoBlock.template.outputs[0].basicCard.title = title;
    templateBCard_DoBlock.template.outputs[0].basicCard.description = desc;
    templateBCard_DoBlock.template.outputs[0].basicCard.buttons[0].label = label;
    templateBCard_DoBlock.template.outputs[0].basicCard.buttons[0].blockId = blockId;

    return templateBCard_DoBlock;
}




var makeTemplateBCardXButton = function(title, desc)  {

    var templateBCardXButton = {
      "version": "2.0",
      "template": {
        "outputs": [
          {
            "basicCard": {
              "title": "",
              "description": ""
            }
          }
        ]
      }
    };

    templateBCardXButton.template.outputs[0].basicCard.title = title;
    templateBCardXButton.template.outputs[0].basicCard.description = desc;

    return templateBCardXButton;
}


var makeTemplateBCardUseButton = function(title, desc, action, label, weblinkurl)  {

    var templateBCardUseButton = {
      "version": "2.0",
      "template": {
        "outputs": [
          {
            "basicCard": {
              "title": "",
              "description": "",
              "buttons": [
                {
                  "action":  "",
                  "label": "",
                  "webLinkUrl": ""
                }
              ]
            }
          }
        ]
      }
    };
    
    templateBCardUseButton.template.outputs[0].basicCard.title = title;
    templateBCardUseButton.template.outputs[0].basicCard.description = desc;
    templateBCardUseButton.template.outputs[0].basicCard.buttons[0].action = action;
    templateBCardUseButton.template.outputs[0].basicCard.buttons[0].label = label;
    templateBCardUseButton.template.outputs[0].basicCard.buttons[0].webLinkUrl = weblinkurl;

    return makeTemplateBCardUseButton;
}


var makeTemplateCarousel = function()  {

  let templateCarousel = {
    "version": "2.0",
    "template": {
      "outputs": [
        {
          "carousel": {
            "type": "basicCard",
            "items": [
            ]
          }
        }
      ]
    }
  };

  return templateCarousel;
}

var makeTemplateCarouselAddItem = function()  { // 가변인자

    var carousel = makeTemplateCarousel();

    arguments.foreach((args) => {
      carousel.template.outputs[0].carousel.items.push( args );
    });

    return carousel;
}

var makeTemplateCarouselItem = function(title, desc, imageUrl)  {

    let templateCarouselItem = {
      "title": "", // 1
      "description": "", //2
      "thumbnail": {
        "imageUrl": "" //3
      }
    };

    templateCarouselItem.title = title;
    templateCarouselItem.description = desc;
    templateCarouselItem.thumbnail.imageUrl = imageUrl;

    return templateCarouselItem;
}

var addQuickReplyBlock = function(fromBalloon, label, blockId)  {

    var quickReplyItem = {
        "label": label,
        "messageText": label,
        "action": "block",
        "blockId": blockId
      };

      if( fromBalloon.template.hasOwnProperty("quickReplies") ) {
          fromBalloon.template.quickReplies.push(quickReplyItem);    
      }
      else {
        fromBalloon.template.quickReplies = [];
        fromBalloon.template.quickReplies.push(quickReplyItem);    
      }

    return fromBalloon;
}



module.exports.makeTemplateErrorText      = makeTemplateErrorText;
module.exports.makeTemplateBCard_DoBlock  = makeTemplateBCard_DoBlock;
module.exports.makeTemplateBCardXButton   = makeTemplateBCardXButton;
module.exports.makeTemplateBCardUseButton = makeTemplateBCardUseButton;

module.exports.makeTemplateCarousel       = makeTemplateCarousel;
module.exports.makeTemplateCarouselAddItem = makeTemplateCarouselAddItem;
module.exports.makeTemplateCarouselItem   = makeTemplateCarouselItem;

module.exports.addQuickReplyBlock         = addQuickReplyBlock;

