// Variables
const Discord = require("discord.js");
const prefix = "!";
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
		console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
	};
const config = require("../config.json");
const bloxy = require("bloxy");

// Internal Libraries
const Roblox = require("./RobloxFunctions.js");

// ================================================

const groupIds = {
	MAIN:'4396304',
	ADM: '4406263',
	SAF: '4396451',
	MIA: '4410112',
	KGB: '4409173',
	RG:  '4410110',
	SPE: '4409178',
	MOC: '4409176',
	MOJ: '4410111',
	BIO: '4659509'
}

function mlog(str) { // modified log
	log("[GetGroupsRanks]: " + str);
}

module.exports.main = function(roblox,userid) {
	return new Promise(function(resolve, reject) {
		try {
			let t = {
				MAIN:0,
				ADM: 0,
				SAF: 0,
				MIA: 0,
				KGB: 0,
				RG:  0,
				SPE: 0,
				MOC: 0,
				MOJ: 0,
				BIO: 0
			}
			
			let c = 0;
			mlog(Object.keys(t).length);
			for (let groupKey in groupIds) {
				roblox.getGroup(groupIds[groupKey]).then(g => {
					g.getRankNameInGroup(userid).then(s => {
						if (s != "Guest") {
							g.getRole({name: s}).then(r => {
								t[groupKey] = parseInt(r.rank);
								c++; // lol
								if (c >= Object.keys(t).length) resolve(t);
							}).catch(err => {
								reject(err);
							});
						} else {
							c++;
							if (c >= Object.keys(t).length) resolve(t);
						}
					}).catch(err => {
						reject(err);
					});
				}).catch(err => {
					reject(err);
				});
			}
		} catch(err) {
			reject(err);
		}
	});
}