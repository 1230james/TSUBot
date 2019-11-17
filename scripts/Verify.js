// Variables
const Discord = require("discord.js");
const prefix = "!";
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
	console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
};
const request = require('request');
const database = require("../database.json");

// Internal Libraries 
const DiscFunc = require("./DiscFunctions.js");
const Roblox = require("./RobloxFunctions.js");

// File read/write
function db(arr,val) {
	DiscFunc.db(arr,val);
}

// ================================================

const groupRankThresh = {
	ADM: {MR: 40,  HR: 70,  HC: 90},
	SAF: {MR: 60,  HR: 100, HC: 130},
	MIA: {MR: 50,  HR: 80,  HC: 120},
	KGB: {MR: 40,  HR: 70,  HC: 100},
	RG:  {MR: 30,  HR: 50,  HC: 60},
	SPE: {MR: 40,  HR: 40,  HC: 50},
	MOC: {MR: 40,  HR: 60,  HC: 70},
	MOJ: {MR: 60,  HR: 60,  HC: 70},
	BIO: {MR: 40,  HR: 60,  HC: 70},
}


function getRoleID(roleName) { DiscFunc.getRoleID(roleName); }

module.exports.main = function(message) {
	if (message.channel.id != '485564809325051906' && message.channel.id != '554344300947832872') return;
	DiscFunc.sendMessage(message,"Thanks for joining **The Soviet Union**! Please wait while I try to verify you, " + message.author + "...");
	var url = "https://verify.eryn.io/api/user/" + message.author.id;
	var userID;
	var groupID = 4396304;
	var player;
	if (Date.now() - database["RATETIME"] > 60000) {
		db("RATETIME", Date.now());
		db("RATECOUNT", 0);
	}
	if (database["RATECOUNT"] > 59) {
		DiscFunc.sendMessage(message,"Too many people are trying to verify at once! " + message.author + ", please wait " + Math.floor((Date.now() - database["RATETIME"]) / 1000) + " seconds before trying again.","Rate limited");
		return;
	}
	request(url, function (error, response, body) {
		if (error) {
			DiscFunc.sendMessage(message,"Something went wrong! Please try again later or contact <@126516587258707969>.\n\nERROR MESSAGE:```" + error + "```","Eryn.io lookup error");
			return;
		}
		try {
			var verifyObj = JSON.parse(body);
		} catch(err) {
			DiscFunc.sendMessage(message,"Something is wrong with the verification server. Please try again later.","Eryn.io is down? \n\n" + err);
			return;
		}
		if (verifyObj.status == "error") {
			if (verifyObj.errorCode == 404) {
				DiscFunc.sendMessage(message,"**I cannot find your Roblox account!** Please get verified here: https://verify.eryn.io \nIf you already did, then wait a few minutes before trying again, or try verifying again.","Tried to verify but user was not found.");
			} else {
				DiscFunc.sendMessage(message,"**There was an error!**\n\n```" + verifyObj.error + "```Error Code: " + verifyObj.errorCode,"Eyrn.io response error.");
				if (verifyObj.retryAfterSeconds) DiscFunc.sendMessage(message,"Retry in " + verifyObj.retryAfterSeconds + " seconds.");
			}
		}
		else {
			userID = verifyObj.robloxId;
			Roblox.getGroupsRanks(userID).then(ranks => {
				let traits = {}
				for (let group in ranks) {
					let rankVal = ranks[group];
					
					// Armed Forces / Ministry Officer
					if (groupRankThresh.hasOwnProperty(group) && rankVal >= groupRankThresh[group].HR) {
						if (group == "SAF") traits.AFO = true
						else traits.MO = true;
					}
					
					// CPSU
					if (group == "MAIN") {
						if (rankVal >= 90) traits.PARTY = true;
						switch(rankVal) {
							case 255:
								traits.GS = true;
								break;
							case 200:
								traits.P = true;
								break;
							case 150:
								traits.DP = true;
								break;
							case 140:
								traits.CC = true;
								break;
							case 130:
								traits.POL = true;
								break;
							case 120:
								traits.SEC = true;
								break;
							case 110:
								traits.ORG = true;
								break;
							case 100:
								traits.COM = true;
								break;
							default:
								// idklol
						}
					}
					
					
				}
				DiscFunc.sendMessage(message,s,"Role test");
			});
			
			/* Roblox.findPlayerInGroup(userID, groupID).then(player => {
			
			
				
			
			
			var index;
			let newRoles = [];
			let oldRoles = [];
			
			let cpsuRoles = [getRoleID("Council of Ministers"),getRoleID("Speaker of the Council"),getRoleID("The First Secretary"),getRoleID("Presidium"),getRoleID("Central Committee"),getRoleID("Head of Central Committee")];
			let ministryRoles = [getRoleID("Ministry Officer"),getRoleID("Ministry Employee"),getRoleID("Immigration Officer")];
			let safRoles = [getRoleID("Armed Forces Leadership"),getRoleID("Soviet Armed Forces")];
			let civRoles = [getRoleID("Foreign Immigrants"),getRoleID("Soviet Citizen")];
			
			// ======= ROLE ARRAYS ========
			
			if (player.parent.role.Rank == 235) { index = 0; newRoles = [getRoleID("Foreign Immigrants")]; oldRoles = cpsuRoles.concat(ministryRoles).concat(safRoles).concat([getRoleID("Soviet Prison Service"),getRoleID("Soviet Citizen"),getRoleID("Upper Soviet Citizen")]); }
			
			if (player.parent.role.Rank == 237) { index = 1; newRoles = [getRoleID("Soviet Prison Service")]; oldRoles = cpsuRoles.concat(ministryRoles).concat(safRoles).concat([getRoleID("Foreign Immigrants"),getRoleID("Soviet Citizen"),getRoleID("Upper Soviet Citizen")]); }
			
			if (player.parent.role.Rank == 238) { index = 2; newRoles = [getRoleID("Soviet Citizen")]; oldRoles = cpsuRoles.concat(ministryRoles).concat(safRoles).concat([getRoleID("Foreign Immigrants")]); }
			
			if (player.parent.role.Rank == 239) { index = 3; newRoles = [getRoleID("Upper Soviet Citizen")]; oldRoles = cpsuRoles.concat(ministryRoles).concat(safRoles).concat(civRoles); }
			
			if (player.parent.role.Rank == 240) { index = 4; newRoles = [getRoleID("Soviet Armed Forces")]; oldRoles = cpsuRoles.concat(ministryRoles).concat([getRoleID("Armed Forces Leadership")]).concat(civRoles); }
			
			if (player.parent.role.Rank == 241) { index = 5; newRoles = [getRoleID("Armed Forces Leadership")]; oldRoles = cpsuRoles.concat(ministryRoles).concat(civRoles) }
			
			if (player.parent.role.Rank == 242) { index = 6; newRoles = [getRoleID("Immigration Officer")]; oldRoles = cpsuRoles.concat(civRoles).concat(safRoles) }
			
			if (player.parent.role.Rank == 243) { index = 7; newRoles = [getRoleID("Ministry Employee")]; oldRoles = cpsuRoles.concat(civRoles).concat(safRoles) }
			
			if (player.parent.role.Rank == 244) { index = 8; newRoles = [getRoleID("Ministry Officer")]; oldRoles = cpsuRoles.concat(civRoles).concat(safRoles) }
			
			if (player.parent.role.Rank == 246) { index = 9; newRoles = [getRoleID("Council of Ministers")]; oldRoles = [getRoleID("Speaker of the Council"),getRoleID("The First Secretary"),getRoleID("Presidium"),getRoleID("Central Committee"),getRoleID("Head of Central Committee")] }
			
			if (player.parent.role.Rank == 247) { index = 10; newRoles = [getRoleID("Speaker of the Council")]; oldRoles = [getRoleID("Council of Ministers"),getRoleID("The First Secretary"),getRoleID("Presidium"),getRoleID("Central Committee"),getRoleID("Head of Central Committee")] }
			
			if (player.parent.role.Rank == 248) { index = 11; newRoles = [getRoleID("The First Secretary")]; oldRoles = [getRoleID("Council of Ministers"),getRoleID("Speaker of the Council"),getRoleID("Presidium"),getRoleID("Central Committee"),getRoleID("Head of Central Committee")] }
			
			if (player.parent.role.Rank == 249) { index = 12; newRoles = [getRoleID("Presidium")]; oldRoles = [getRoleID("Council of Ministers"),getRoleID("Speaker of the Council"),getRoleID("The First Secretary"),getRoleID("Central Committee"),getRoleID("Head of Central Committee")] }
			
			if (player.parent.role.Rank == 250) { index = 13; newRoles = [getRoleID("Central Committee")]; oldRoles = [getRoleID("Council of Ministers"),getRoleID("Speaker of the Council"),getRoleID("The First Secretary"),getRoleID("Presidium"),getRoleID("Head of Central Committee")] }
			
			if (player.parent.role.Rank == 251) { index = 14; newRoles = [getRoleID("Head of Central Committee")]; oldRoles = [getRoleID("Council of Ministers"),getRoleID("Speaker of the Council"),getRoleID("The First Secretary"),getRoleID("Presidium"),getRoleID("Central Committee")] }
			
			// ======= ROLE ARRAYS ========
			
			//function setAdmissionRole(member, userid, rank) { // rank is a string
			//setAdmissionRole(message.member, userID, rankChar);
			
			//function setDiscordRole(member,newRoles,oldRoles)
			DiscFunc.setDiscordRole(message.member,newRoles,oldRoles)
			
			let prefixL = ["Immigrant","Prisoner","Citizen","Upper Citizen","Armed Forces","Armed Forces Leader","Immigration Officer","Ministry Employee","Ministry Officer","CoM Member","Speaker of the Council","First Secertary","Presidium","Central Committee","Head of the Central Committee"];
			let prefixS = ["I","Pri","Civ","USC","SAF","AFL","IO","ME","MO","CoM","SotC","FS","P","CC","HoCC"];
			
			var nickname = player.name;
			if (nickname.length > 32) nickname = nickname.substring(0,31);
			message.member.setNickname(nickname);
			DiscFunc.sendMessage(message,"Verified! Hello, **" + player.name + "**!","Verified");
			}).catch(function(error) {
				try {
					/*DiscFunc.setDiscordRole(message.member,[],[]);
					let nickname = "[Guest] " + verifyObj.robloxUsername;
					if (nickname.length > 32) nickname = nickname.substring(0,31);
					message.member.setNickname(nickname);
					DiscFunc.sendMessage(message,"Verified! Hello, **" + verifyObj.robloxUsername + "**!","Verified");
				} catch(err) {
					DiscFunc.sendMessage(message,"Uh oh; something went wrong!\nContact <@126516587258707969> if the problem persists for more than 5 minutes.\n\nError Message:```" + err + "```","=== VERIFY ERROR ===\n" + err);
				}
			});*/
		}
	});
	DiscFunc.db("RATECOUNT", database["RATECOUNT"] + 1);
}