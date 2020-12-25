// Set online status message on bot's Roblox account in Korean

const ampm = [
    "오전",
    "오후"
];
const hourStr = [
    "열두", // since we subtract 12 from the hour if hour >= 12, put "twelve" first
    "한",
    "두",
    "세",
    "네",
    "다섯",
    "여섯",
    "일곱",
    "여덟",
    "아홉",
    "열",
    "열한"
];
const minStr = [
    "일",
    "이",
    "삼",
    "사",
    "오",
    "육",
    "칠",
    "팔",
    "구",
    "십"
];

// =====================================================================================================================

// Plug in an hour (in the range [0, 23]) -> get a string that reads "`hour` AM/PM" in Korean
function getHourString(hour) {
    let str;
    if (hour > 12) {
        hour -= 12;
        //str = ampm[1] + " ";
    } else {
        //str = ampm[0] + " ";
    }
    return hourStr[hour] + " 시";
}

// Plug in a minute (in the range [0, 59]) -> get a string that reads "`min` minutes" in Korean
// Time in Korean includes the noun "minutes". For example, 12:52 would be "twelve fifty-two" in English, but in Korean,
// it would be something like "twelve hours, fifty-two minutes".
function getMinString(min) {
    // Special case: 0
    if (min == 0) return "";
    
    // Get numbers
    let tens = Math.floor(min / 10);
    let ones = min % 10;
    
    // Construct string
    let str = " 분";
    if (ones > 0) {
        str = minStr[ones - 1] + str;
    }
    if (tens > 0) {
        str = minStr[9] + str;
        if (tens > 1) {
            str = minStr[tens - 1] + str;
        }
    }
    
    // Return
    return str;
}

// Plug in a Date -> get the time written in Korean
function getTimeStr(date) {
    let hour = date.getUTCHours();
    let min  = date.getUTCMinutes();
    return getHourString(hour) + " " + getMinString(min);
}

/** Updates the status blurb on the bot's Roblox account with Korean text that states when the bot started "working"
  * (read: went online) and for how many hours it has been.
  * @param `bot` from the main thread.
  * @param date The `Date` object that represents the time the bot "started working"/went online.
  * @param hoursOnline A number (preferably an integer) representing the number of hours the bot as been online.
*/
function main(bot, date, hoursOnline) {
    return new Promise(async (resolve, reject) => {
        let str = getTimeStr(date) + "부터 " + hoursOnline + "시간 동안 일했어요.";
        bot.util.glog("Setting online status: '" + str + "'");
        
        let stopExecution = false;
        let result = await bot.util.setRobloxStatus(bot.util.Roblox, str).catch((err) => {
            stopExecution = err; 
        });
        if (stopExecution) {
            return reject(stopExecution);
        }
        return resolve(result);
    });
}

// =====================================================================================================================

module.exports = {
    name: "setOnlineStatus",
    func: main
}
