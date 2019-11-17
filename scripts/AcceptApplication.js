// Variables
const Discord = require("discord.js");
const prefix = "!";
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
	console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
};
const request = require('request');
const database = require("../database.json");
//const apps = require("../apps.json");
const GoogleSpreadsheet = require("google-spreadsheet");
var databaseSheet = new GoogleSpreadsheet("1shDlZbi5m_vYa-po_Ry-u4mTfpePsTCARi44nv-e7SA");

// Internal Libraries 
const DiscFunc = require("./DiscFunctions.js");
const Roblox = require("./RobloxFunctions.js");
const TrelloFunc = require("./TrelloFunctions.js");

// File read/write
function db(arr,val) {
	DiscFunc.db(arr,val);
}

// ================================================

const guildIds = {
	"485528044828753940": "TES",
	"487826562679570435": "ADM",
	"487826494257627136": "SAF",
	"487830061437681666": "MIA",
	"487827391771705345": "KGB",
	"487826670489829376": "RG",
	"487827617274134549": "SPE",
	"487830813938024458": "MOC",
	"487828822637543435": "MOJ"
	//"BIO"
}
const groupIds = {
	MAIN:'4396304', // Don't remove this nor TES
	TES: '4396304', // Should match MAIN
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
const appChannelIds = {
	TES: '552649805088817190',
	ADM: '554180305104273418',
	SAF: '554207457887518730',
	MIA: '554206958379466752',
	KGB: '578294849002930207',
	RG:  null,
	SPE: null,
	MOC: null,
	MOJ: '617481829901008899',
	BIO: null
}

// App lookup
function canUserApply(userID,divKey) {
	return new Promise(function(resolve, reject) {
		try {
			databaseSheet.useServiceAccountAuth(require("../GoogleAPIAuth.json"), function() {
				log("Authenticated?");
				databaseSheet.getInfo(function(err1,obj1) {
					if (err1) {log("Sheets Error: " + err1); return;}
					log("Fetching worksheets");
					let arr = obj1.worksheets;
					let sheet;
					log("Loaded worksheets");
					for (let i=0;i<arr.length;i++) {
						if (arr[i].title == divKey) {
							sheet = arr[i];
							log("Found sheet");
							break;
						}
					}
					if (sheet) {
						sheet.getRows(function(err2,rows) {
							if (err2) {reject(err2); return;}
							for (row of rows) {
								if (row["key"] == userID) {
									log("Found user!");
									if (JSON.parse(row["value"])[0] == true) {resolve(true); return;}
									else resolve(false);
								} 
							}
							resolve(false);
						});
					} else {
						resolve(false);
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
}

function markAsRead(userID,divKey) {
	return new Promise(function(resolve, reject) {
		try {
			databaseSheet.useServiceAccountAuth(require("../GoogleAPIAuth.json"), function() {
				log("Authenticated?");
				databaseSheet.getInfo(function(err1,obj1) {
					if (err1) {log("Sheets Error: " + err1); return;}
					log("Fetching worksheets");
					let arr = obj1.worksheets;
					let sheet;
					log("Loaded worksheets");
					for (let i=0;i<arr.length;i++) {
						if (arr[i].title == divKey) {
							sheet = arr[i];
							log("Found sheet");
							break;
						}
					}
					if (sheet) {
						sheet.getRows(function(err2,rows) {
							if (err2) {reject(err2); return;}
							for (row of rows) {
								if (row["key"] == userID) {
									row["value"] = JSON.stringify([false,""]);
									row.save();
									resolve();
								}
							}
						});
					} else {
						resolve();
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
}

function viewApp(userID,divkey) {
	return new Promise(function(resolve, reject) {
		try {
			databaseSheet.useServiceAccountAuth(require("../GoogleAPIAuth.json"), function() {
				log("Authenticated?");
				databaseSheet.getInfo(function(err1,obj1) {
					if (err1) {log("Sheets Error: " + err1); return;}
					log("Fetching worksheets");
					let arr = obj1.worksheets;
					let sheet;
					log("Loaded worksheets");
					for (let i=0;i<arr.length;i++) {
						if (arr[i].title == divkey) {
							sheet = arr[i];
							log("Found sheet");
							break;
						}
					}
					if (sheet) {
						sheet.getRows(function(err2,rows) {
							if (err2) {reject(err2); return;}
							for (row of rows) {
								if (row["key"] == userID) {
									let arr2 = JSON.parse(row["value"]);
									if (arr2[0] == true) {
										resolve(arr2[1]);
									} else {
										resolve("No app found.");
									}
								}
							}
						});
					} else {
						resolve();
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
}

function getAppList(divkey) {
	return new Promise(function(resolve, reject) {
		try {
			databaseSheet.useServiceAccountAuth(require("../GoogleAPIAuth.json"), function() {
				log("Authenticated?");
				databaseSheet.getInfo(function(err1,obj1) {
					if (err1) {log("Sheets Error: " + err1); return;}
					log("Fetching worksheets");
					let arr = obj1.worksheets;
					let sheet;
					log("Loaded worksheets");
					for (let i=0;i<arr.length;i++) {
						if (arr[i].title == divkey) {
							sheet = arr[i];
							log("Found sheet");
							break;
						}
					}
					if (sheet) {
						sheet.getRows(function(err2,rows) {
							if (err2) {reject(err2); return;}
							let appArr = []
							for (row of rows) {
								let userID = row["key"]
								let arr2 = JSON.parse(row["value"]);
								if (arr2[0] == true) {
									appArr[appArr.length] = userID;
								}
							}
							resolve(appArr);
						});
					} else {
						resolve();
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
}

/*module.exports.record = function(message) {
	let s = message.content;
	let i0 = s.indexOf("\n**Applicant**: ");
	s = s.substring(i0);
	let i1 = s.indexOf(" ") + 1;
	let i2 = s.indexOf("\nhttp");
	let username = s.substring(i1,i2);
	
	let roblox = Roblox.getRoblox();
	roblox.getIdByUsername(username).then(userId => {
		if (!(apps.hasOwnProperty(userId)) || !(apps[userId].hasOwnProperty(guildIds[message.guild.id]))) {
			log("Previous app record not found - generating...");
			let t1 = {}
			let t2 = {active: true}
			t1[guildIds[message.guild.id]] = t2;
			apps[userId] = t1;
		} else {
			log("Previous app record found - updating...");
			apps[userId][guildIds[message.guild.id]].active = true;
		}
		DiscFunc.updateFile("apps",apps);
	});
}*/

module.exports.view = function(message,username) {
	if (appChannelIds[guildIds[message.guild.id]] == null || appChannelIds[guildIds[message.guild.id]] != message.channel.id) return;
	let roblox = Roblox.getRoblox();
	if (username != null && username != "") {
		message.channel.send("Fetching application; please wait...").then(msg => {
			roblox.getIdByUsername(username).then(userId => {
				let div = guildIds[message.guild.id];
				let groupId = groupIds[div];
				canUserApply(userId,div).then(canApply => {
					if (canApply == null || canApply == false) {
						msg.delete();
						DiscFunc.sendMessage(message,"No application by " + username + " found.","Tried to view " + username + "'s app, but found none.");
						return;
					}
					viewApp(userId,div).then(appContents => {
						if (appContents.length < 2000) {
							DiscFunc.sendMessage(message,appContents,"Viewed " + username + "'s app.");
							msg.delete();
						} else {
							let footer = "`End of " + username + "'s application`"
							let maxLength = 2000 - (footer.length);
							let timer = setInterval(function() {
								let tApp = appContents.substring(0,maxLength);
								appContents = appContents.substring(maxLength);
								DiscFunc.sendMessage(message,tApp);
								if (appContents.length <= 0) { clearInterval(timer); msg.delete(); log("Viewed " + username + "'s app."); }
							},100);
						}
					});
				}).catch(err => {
					DiscFunc.sendMessage(message, "An error occurred.\n" + err, err);
				});
			}).catch(err => {
				DiscFunc.sendMessage(message, "An error occurred.\n" + err, err);
			});
		})
	}
}

module.exports.list = function(message) {
	if (appChannelIds[guildIds[message.guild.id]] == null || appChannelIds[guildIds[message.guild.id]] != message.channel.id) return;
	let roblox = Roblox.getRoblox();
	let div = guildIds[message.guild.id];
	let groupId = groupIds[div];
	//DiscFunc.sendMessage(message,"Please wait; this may take some time if there's a large backlog.");
	message.channel.send("Fetching application list; please wait...\nThis make take some time if there is a long list.").then(msg => {
		getAppList(div).then(appList => {
			let s = "";
			let c = 0;
			for (user of appList) {
				roblox.getUsernameById(user).then(username => {
					s += username + "\n";
				}).finally(()=> {c++;});
			}
			let timer = setInterval(function() {
				if (c >= appList.length) {
					if (appList.length == 0) s = "No one!"
					msg.edit("**__Users with pending applications__**\n" + s);
					log("Got pending apps for " + div);
					clearInterval(timer);
				}
			},100);
		}).catch(err => {
			DiscFunc.sendMessage(message, "An error occurred.\n" + err, err);
		});
	});
}

module.exports.deny = function(message,username) {
	if (appChannelIds[guildIds[message.guild.id]] == null || appChannelIds[guildIds[message.guild.id]] != message.channel.id) return;
	let roblox = Roblox.getRoblox();
	if (username != null && username != "") {
		roblox.getIdByUsername(username).then(userId => {
			let div = guildIds[message.guild.id];
			let groupId = groupIds[div];
			canUserApply(userId,div).then(canApply => {
				if (canApply == null || canApply == false) {
					DiscFunc.sendMessage(message,"No application by " + username + " found.","Tried to dent " + username + "'s app, but found none.");
					return;
				}
				markAsRead(userId,div);
				DiscFunc.sendMessage(message, "Denied " + username + "'s application.", "Denied " + username + "'s application for " + div);
			}).catch(err => {
				DiscFunc.sendMessage(message, "An error occurred.\n" + err, err);
			});
		}).catch(err => {
			DiscFunc.sendMessage(message, "An error occurred.\n" + err, err);
		});
	}
}

module.exports.accept = function(message,username) {
	if (appChannelIds[guildIds[message.guild.id]] == null || appChannelIds[guildIds[message.guild.id]] != message.channel.id) return;
	let roblox = Roblox.getRoblox();
	if (username != null && username != "") {
		roblox.getIdByUsername(username).then(userId => {
			let div = guildIds[message.guild.id];
			let groupId = groupIds[div];
			canUserApply(userId,div).then(canApply => {
				if (canApply == null || canApply == false) {
					DiscFunc.sendMessage(message,"No application by " + username + " found.","Tried to accept " + username + "'s app, but found none.");
					return;
				}
				TrelloFunc.isUserPrisoner(userId).then(isPrisoner => {
					if (isPrisoner) {
						DiscFunc.sendMessage(message,username + " is a prisoner of the Soviet Union.\nTheir application has been denied instead.","Tried to accept " + username + "'s app, but they were a prisoner.");
						markAsRead(userId,div);
						return;
					}
					// If application found, accept join req
					roblox.getGroup(groupId).then(g => {
						try {
							Roblox.getJoinRequestFromPlayer(g,userId).then(req => {
								if (req) {
									g.acceptJoinRequest(req.requestId).then(()=>{
										// Set main group rank
										Roblox.getGroupsRanks(userId).then(ranks => {
											if (ranks.MAIN <= 50 && ranks.MAIN != 20) {
												roblox.getGroup(groupIds.MAIN).then(mainGroup => {
													let searchOptions = {rank: 0};
													if (div == "SAF") searchOptions.rank = 50
													else searchOptions.rank = 70;
													// Apparently I have to get the role first to get the role id instead of using the rank value? that's dumb
													mainGroup.getRole(searchOptions).then(role => {
														mainGroup.setRank(userId,role.id).then(()=>{
															/*markAsRead(userId,div);
															DiscFunc.sendMessage(message,username + "'s application was accepted and has been accepted into the group!","Accepted " + username + " to " + div);*/
														}).catch(err => {
															DiscFunc.sendMessage(message,"Hey <@126516587258707969>, something went bad when trying to set their main group rank!\nMaybe check the cookie?\n\n" + err);
														});
													}).catch(err => {
														DiscFunc.sendMessage(message,"Hey <@126516587258707969>, something went bad when trying to find the right rank!\n\n" + err);
													});
												}).catch(err => {
													DiscFunc.sendMessage(message,"Hey <@126516587258707969>, something went bad when trying to find the main group!\n\n" + err);
												});
											}
											markAsRead(userId,div);
											DiscFunc.sendMessage(message,username + "'s application was accepted and been accepted into the group!","Accepted " + username + " to " + div);
										}).catch(err => {
											let m = "**Join request acceptance failed - please do it manually.**\n";
											if (err.toString().indexOf("Status code: 400, status message: Bad Request") < 0) m += "<@126516587258707969> ";
											DiscFunc.sendMessage(message,m + err);
										});
									}).catch(err => {
										DiscFunc.sendMessage(message,"Error occurred when trying to accept join request.\n<@126516587258707969>, check the cookie!\n\n" + err,"Join req accept error: " + err);
									});
								} else {
									DiscFunc.sendMessage(message,username + " did not send a join request.");
								}
							}).catch(err => {
								DiscFunc.sendMessage(message,"Error occurred when trying to retrieve join request.\n<@126516587258707969>, check the cookie!\n\n" + err,"GetJoinRequests error: " + err);
							});
						} catch(err) {
							DiscFunc.sendMessage(message,"Error occurred.\n<@126516587258707969>, check the cookie!\n\n" + err,"App accept error: " + err);
						}
					}).catch(err => {
						DiscFunc.sendMessage(message, "An error occurred when trying to retrieve division group.\n" + err, err);
					});
				}).catch(err => {
					DiscFunc.sendMessage(message, "An error occurred while trying to determine prisoner status.\n" + err, err);
				});
			}).catch(err => {
				DiscFunc.sendMessage(message, "An error occurred.\n" + err, err);
			});
		});
	}
}
