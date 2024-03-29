// Test for kakaotalk bot builder

var testGet = function(req, res) {
    console.log('GET호출 test. 텍스트 말풍선 응답');
  
    var responseBody = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "hello I'm Get Tester"
            }
          }
        ]
      }
    };
  
    res.status(200).send(responseBody);
  }
  
  var testPost1 = function(req, res) {
    console.log('POST호출 test. 텍스트 말풍선 응답');
  
    var responseBody = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "hello I'm Ryan"
            }
          }
        ]
      }
    };
  
    res.status(200).send(responseBody);
  }
  
  var testPost2 = function(req, res) {
    console.log('POST호출 test. 이미지 말풍선 응답');
  
    const responseBody = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleImage: {
              imageUrl: "https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg",
              altText: "hello I'm Ryan"
            }
          }
        ]
      }
    };
  
    res.status(200).send(responseBody);
  }
  
  module.exports.testGet = testGet;
  module.exports.testPost1 = testPost1;
  module.exports.testPost2 = testPost2;
  