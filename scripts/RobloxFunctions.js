// Variables
const Discord = require("discord.js");
const prefix = "!";
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
		console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
	};
const config = require("../config.json");
const roblox = require("noblox.js");
roblox.cookieLogin(config.roblox.cookie);
setStatus("Verified online at " + (new Date()).toUTCString());
log("Roblox is ready!");

// Internal Libraries
const DiscFunc = require("./DiscFunctions.js");
//const GetGroupsRanks = require("./GetGroupsRanks.js");

// Set status
function setStatus(msg) {
    roblox.http({
        url: "https://www.roblox.com/home/updatestatus/",
        options: {
            method: "POST",
            inputs: {
                status: msg
            },
            json: true
        }
    }).then(function (res) {
        if (res.statusCode === 200) {
            return true
        } else {
            return false
        }
    });
}

// ============================================================================

// Get a reference to the Roblox client
module.exports.getRoblox = function() {
	return roblox;
}

// Set status
module.exports.setStatus = function(msg) {
    setStatus(msg);
}

// Get table with div ranks (mainly for role setting stuff in Verify)
/*
module.exports.getGroupsRanks = function(userid) {
	return GetGroupsRanks.main(roblox,userid);
}
*/

// Cookie Login
module.exports.cookieLogin = function(_cookie,msg) {
	config.roblox.cookie = _cookie;
	DiscFunc.updateFile("config",config);
	DiscFunc.sendMessage(msg,"Got cookie - logging in...");
	
	try {
		roblox.cookieLogin(config.roblox.cookie);
		DiscFunc.sendMessage(msg,"Logged in!","Roblox is ready!");
	} catch(err) {
		DiscFunc.sendMessage(msg,"Something went wrong!\n" + err,
            "Cookie login error: " + err);
	}
}

// 2FA - Not sure if it works
module.exports.twoFactorAuth = function(code,msg) {
    return;
    /*
	config.roblox.code = code;
	DiscFunc.updateFile("config",config);
	DiscFunc.sendMessage(msg,"Code accepted - restarting bot...");
	
	let botStatus = {} 
	botStatus.status = 'invisible'
	bot.user.setPresence(botStatus).catch(err => {log(err)}); 
	throw "===== RESTARTING =====";
    */
}

/*
// Find player in group
module.exports.findPlayerInGroup = function(userid, groupid) {
	return new Promise(function(resolve, reject) {
		console.log("Finding player...");
		var players;
		var player;
		roblox.getPlayers(groupid)
		.then(obj => {
			players = obj.players;
			for (var _=0; _< players.length; _++) {
				if (players[_].id == userid) {
					player = players[_];
					console.log("Got player! " + player.name);
				}
			}
		})
		.then(function(){
			if (player) resolve(player);
			else reject();
		});
	});
}

// Set Group Rank
module.exports.setGroupRank = function(userid, groupid, rankid) {
	roblox.setRank(groupid, userid, rankid);
	console.log("Roblox group rank set");
}

// Get player's join request
function getJoinRequest(group,userid,count) {
	log("getJoinReq");
	return new Promise(function(resolve, reject) {
		let joinRequest;
		group.getJoinRequests({page: count}).then(reqs => {
			console.log("count " + count);
			console.log(reqs.length);
			for (req of reqs) {
				if (req.userId == userid) {
					joinRequest = req;
				}
			}
			if (reqs.length <= 0) return resolve(null);
			if (joinRequest) return resolve(joinRequest)
			else return resolve(getJoinRequest(group,userid,count+1));
		}).catch(err => {
			reject(err);
		});
	});
}
module.exports.getJoinRequestFromPlayer = function(group,userid) {
	return new Promise(function(resolve, reject) {
		try {
			if (typeof group != "object") {
				reject(Error.new("Argument group was not a Group object!"));
			}
			return resolve(getJoinRequest(group,userid,1));
		} catch(err) {
			reject(err);
		}
	});
}
*/