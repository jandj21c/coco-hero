
var util            = require('../util');
const eventPrice   	= require('../eventAPI/eventPrice');
const db 			= require('../models/index');

let PriceTimerModel = new db.Timer;
let UserModel = new db.User;


// 글로벌 변수 

let before01MinAlim = 0;
let before10MinAlim = 0;
let before30MinAlim = 0;

let before01HourAlim = 0;
let before03HourAlim = 0;
let before06HourAlim = 0;

let beforeDay9clock = 0;

var eventReadyPriceNotify = function() {

    console.log('init - Price Notifier 시작.');
    
	initFirePriceNotifier();
};

function initFirePriceNotifier() {

    const today = new Date();

    const startday = today.getDate();
    const startMin = today.getMinutes();
    const startHour = today.getHours();

    console.log(`init - NotifyTimer 현재시각 : ${startHour}, 현재 분 : ${startMin}`);

    before01MinAlim = startMin;
    before10MinAlim = startMin;
    before30MinAlim = startMin;

    before01HourAlim = startHour;
    before03HourAlim = startHour;
    before06HourAlim = startHour;

    beforeDay9clock = startday;
    
	setInterval(firePriceNoti_10Sec, 1000 * 10); // 10초 마다
}

function firePriceNoti_10Sec() {

    // 타이머 종류
    // 분: 1, 5, 30
    // 시: 1, 3, 6
    // 정각: 오전 9시

    const now = new Date();
    const currentMin = now.getMinutes();
    const currentHour = now.getHours();
    const currentDay = now.getDate();

    minuteTimers(currentMin);
    hourTimers(currentHour);
    dayTimers(currentDay, currentHour);
}

function minuteTimers(currentMin) {
    
    if( before01MinAlim == currentMin)
        return;

    onTimer_1Min(currentMin);
    onTimer_10Min(currentMin);
    onTimer_30Min(currentMin);

    //onTimer_9clock(now.getDate());
    
    //let currentHour = now.getHours();

}

function hourTimers(currentHour) {
       
    if( before01HourAlim == currentHour) {
        return;
    }

    onTimer_1HOUR(currentHour);
    onTimer_3HOUR(currentHour);
    onTimer_6HOUR(currentHour);

    //onTimer_9clock(now.getDate());
}


function dayTimers(currentDay, currentHour) {
       
    if( beforeDay9clock == currentDay) {
        return;
    }

    onTimer_9clock(currentDay, currentHour);
}


// START - MINUTES TIMERS 
async function onTimer_1Min(currentMin) {

    if( before01MinAlim == currentMin ){
        return;
    }

    before01MinAlim = currentMin;

    await fireGenerator(1);
}

async function onTimer_10Min(currentMin) {

    if( before10MinAlim == currentMin ){
        return;
    }

    if( currentMin == 0 ||  currentMin % 10 == 0 ) {

        before10MinAlim = currentMin;

        await fireGenerator(10);
    }
}

async function onTimer_30Min(currentMin) {

    if( before30MinAlim == currentMin ){
        return;
    }

    if( currentMin == 30 || currentMin == 0) {

        before30MinAlim = currentMin;

        await fireGenerator(30);
    }
}
// END - MINUTES TIMERS 


// START = HOURS TIMERS
async function onTimer_1HOUR(currentHour) {

    if( before01HourAlim == currentHour ){
        return;
    }

    before01HourAlim = currentHour;

    await fireGenerator(60);
}

async function onTimer_3HOUR(currentHour) {

    if( before03HourAlim == currentHour ){
        return;
    }

    if( currentHour == 0 ||  currentHour % 3 == 0 ) {

        before03HourAlim = currentHour;

        await fireGenerator(180);
    }
}

async function onTimer_6HOUR(currentHour) {

    if( before06HourAlim == currentHour ){
        return;
    }

    if( currentHour == 0 || currentHour % 6 == 0) {

        before06HourAlim = currentHour;

        await fireGenerator(360);
    }
}
// END = HOURS TIMERS

// START - DAY TIMERS
async function onTimer_9clock(currentDay, currentHour) {

    if( beforeDay9clock == currentDay ){
        return;
    }

    if( currentHour == 9 ) {  // 미국 0시,  한국 오전 9시

        beforeDay9clock = currentDay;

        await fireGenerator(1440);
    }
}
// END - DAY TIMERS

async function fireGenerator(interval) {
	var idList = [];

	const timeList = await PriceTimerModel.getTimerByInterval(interval, (timers) => {
		timers.forEach((timer) => {
				if( timer.coinlist.length > 0 )
				{
					//console.log(`유저: ${timer.botuserid}`);
					idList.push(timer.botuserid);
				}
			});
		firePriceNoti(idList);
	});
}

function firePriceNoti(userList) {

	if( userList.length == 0 )
        return;
        
    console.log(`FIRE EVENT 시세알림 전송할 유저수 : ${userList.length}`);

    /*
    var idList = [];
    idList[0] = "396cec1b746d8cbcd73f197f47391e27b3fd5451dd451cd2d9f3c46160e6ae768d"; // 리플챗봇 마스터
    idList[1] = "cc5df510aef1907b02df5861d5c52f45e662009c92340a7f6dd6af9afa0210e6ed"; // 지숙이
    idList[2] = "04f47656e3bceac74c26072d147a0bb085c391162e3fd5f61b85efe8bb12e5e98a"; // 송영이
    */

    eventPrice.eventPriceToBotServer(userList);
}


var eventRemoveWallet = function() {

	fireWalletUser();
};

async function fireWalletUser() {

    console.log(`FIRE EVENT 지갑유저 찾기 시작`);

    var idList = [];

    var targetUser = await UserModel.getUserByBalance();

    targetUser.forEach((one) => {
        if( util.isEmpty(one.botuserid) == false)
        {
            console.log(`유저아이디: ${one.botuserid}`);
            idList.push(one.botuserid);
            
        }
    });

    //idList.push("396cec1b746d8cbcd73f197f47391e27b3fd5451dd451cd2d9f3c46160e6ae768d");
    //idList.push("cc5df510aef1907b02df5861d5c52f45e662009c92340a7f6dd6af9afa0210e6ed");
    console.log(`FIRE EVENT 지갑유저 찾기 완료. 인원 : ${idList.length}`);

    eventPrice.eventRemoveWalletFeature(idList);
}

module.exports.eventReadyPriceNotify = eventReadyPriceNotify;
module.exports.eventRemoveWallet = eventRemoveWallet;
