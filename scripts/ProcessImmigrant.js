// Variables
const Discord = require("discord.js");
const prefix = "!";
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
	console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
};
const request = require('request');
const database = require("../database.json");
const GoogleSpreadsheet = require("google-spreadsheet");
var databaseSheet = new GoogleSpreadsheet("1WR361tQRk2ao_bMl6Loya-NA0oQLBQ2XLzfb9yD-noc");

// Internal Libraries 
const DiscFunc = require("./DiscFunctions.js");
const Roblox = require("./RobloxFunctions.js");
const TrelloFunc = require("./TrelloFunctions.js");

// File read/write
function db(arr,val) {
	DiscFunc.db(arr,val);
}

// ================================================

function mlog(str) { // modified log
	log("[Immigrant Process] " + str);
}

module.exports.main = function(message) {
	let username = message.content;
	log("Processing civilian...");
	if (username != null && username != "") {
		message.react("🕒").then(clockReaction => {
			let roblox = Roblox.getRoblox();
			mlog("Got Roblox");
			roblox.getIdByUsername(username).then(userId => {
				mlog("Got UserId " + userId);
				if (userId) {
					roblox.getGroup(4396304).then(mainGroup => {
						mlog("Got main group");
						Roblox.getGroupsRanks(userId).then(ranks => {
							mlog("Got group ranks");
							if (ranks.MAIN == 10) { // If their main group rank is Foreign Immigrant
								TrelloFunc.getStatus(userId).then(results => {
									mlog("Got status");
									let isDC = results[0];
									let isPrisoner = results[1];
									let searchOptions = {rank: 0};
									if (isPrisoner) { searchOptions.rank = 20; }
									else { if (isDC) { searchOptions.rank = 40; }
									else { searchOptions.rank = 30; } }
									// Apparently I have to get the role first to get the role id instead of using the rank value? that's dumb
									mainGroup.getRole(searchOptions).then(role => {
										mlog("Got role");
										mainGroup.setRank(userId,role.id).then(()=>{
											message.react("✅");
										}).catch(err => {
											if (err.hasOwnProperty("message") && err.message.includes("options.uri is a required argument")) {
												DiscFunc.sendMessage(message,"/ Something went wrong for some reason.\n" + message.author + ", post the name again, please.");
											} else {
												DiscFunc.sendMessage(message,"/ Hey <@126516587258707969>, something went bad when trying to set their main group rank!\nMaybe check the cookie?\n\n" + err);
												message.react("🛠");
											}
										}).finally(()=>{
											clockReaction.remove();
										});
									}).catch(err => {
										if (err.hasOwnProperty("message") && err.message.includes("read ECONNRESET")) {
											DiscFunc.sendMessage(message,"/ Something went wrong for some reason.\n" + message.author + ", post the name again, please.");
										} else {
											DiscFunc.sendMessage(message,"/ Hey <@126516587258707969>, something went bad when trying to get the main group ranks!\n\n" + err);
											message.react("🛠");
											clockReaction.remove();
										}
									});
								}).catch(err => {
									DiscFunc.sendMessage(message,"/ Hey <@126516587258707969>, something went bad when trying to determine DC status!\n\n" + err);
									message.react("🛠");
									clockReaction.remove();
								});
							} else {
								clockReaction.remove();
								if (ranks.MAIN == 0 || ranks.MAIN == null) {
									message.react("🖕");
								} else {
									message.react("❌");
								}
							}
						}).catch(err => {
							if (err.hasOwnProperty("message") && err.message.includes("read ECONNRESET")) {
								DiscFunc.sendMessage(message,"/ Something went wrong for some reason.\n" + message.author + ", post the name again, please.");
							} else {
								DiscFunc.sendMessage(message,"/ Hey <@126516587258707969>, something went bad when trying to get the main group ranks!\n\n" + err);
								message.react("🛠");
								clockReaction.remove();
							}
						});
					}).catch(err => {
						DiscFunc.sendMessage(message,"/ Hey <@126516587258707969>, something went bad when trying to find the main group!\n\n" + err);
						message.react("🛠");
						clockReaction.remove();
					});
				} else {
					message.react("❓");
					clockReaction.remove();
				}
			}).catch(err => {
				message.react("❓");
				clockReaction.remove();
			});
		});
	} else {
		message.react("❓");
	}
}

