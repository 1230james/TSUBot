// TSUBOT

// Libraries
var Discord = require("discord.js"); //Set up the bot
var bot = new Discord.Client();
var moment = require("moment");
var fs = require("fs");
var http = require("http");
var config = require("./config.json");
var log = (msg) => { // Console timestamp
		console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
	};
const request = require('request');
const nodeSchedule = require('node-schedule');

// My Scripts + Files
const DiscFunc = require("./scripts/DiscFunctions.js");
const Roblox = require("./scripts/RobloxFunctions.js");
//const Verify = require("./scripts/Verify.js");
const AcceptApp = require("./scripts/AcceptApplication.js");
const ProcessImmigrant = require("./scripts/ProcessImmigrant.js");
const database = require("./database.json");
const databackup = require("./tempdata.json");

// Prepare Bot
bot.on('ready', () => {
	var botStatus = {} // Used for setting the bot's status and online/offline state, etc.
	botStatus.status = 'online'
	botStatus.game = {}
	botStatus.game.name = 'City of Volinsk, Soviet Border'
	botStatus.game.type = "PLAYING"
	bot.user.setPresence(botStatus).catch(log); //Set status and send a message to the console once the bot is ready
	log(`Discord's ready to go!`);
});
// Don't put Roblox login stuff here; it's already in RobloxFunctions.js

// Periodic login status check
const timer = nodeSchedule.scheduleJob("00 * * * *",function() { // "00 * * * *" = Every hour at 0th minute
	let d = new Date();
	Roblox.setStatus("Verified online at " + d.toUTCString());
});

bot.on('message', (message) => { //When the bot is on, do this stuff
let input = message.content.toUpperCase();
let prefix = "!";

// help or cmds - Shows commands and info
if ((input == prefix + "HELP") || (input == prefix + "CMDS")) {
	return;
	if(message.author.bot) return;
	
	var CMDS = `Uhh... hi`

	sendDM(CMDS,'Sent commands');
}

// invite - Auth URL + Server inv
if (input == prefix + "INVITE") {
	return;
	if (message.author.bot) return;
	DiscFunc.sendMessage(message,`__**AUTH URL**__
https://discordapp.com/oauth2/authorize?&client_id=258052804587945984&scope=bot&permissions=0

__**OFFICIAL SERVER**__
https://discord.gg/sjeaWbP
Come here to see new beta features in action, general talk, and for support for PilotBot, WrightBot, and others.`,'Sent auth link')
}

// App Handling
if (input.startsWith(prefix + "VIEW ")) {
	let username = message.content.substring(message.content.indexOf(" ")+1);
	AcceptApp.view(message,username);
}
if (input.startsWith(prefix + "LIST")) {
	AcceptApp.list(message);
}
if (input.startsWith(prefix + "ACCEPT ")) {
	let username = message.content.substring(message.content.indexOf(" ")+1);
	AcceptApp.accept(message,username);
}
if (input.startsWith(prefix + "DENY ")) {
	let username = message.content.substring(message.content.indexOf(" ")+1);
	AcceptApp.deny(message,username);
}

// Passed Border Handling
if (message.channel.id == '495836903283752975') {
	if (!(input.startsWith("/"))) {
		ProcessImmigrant.main(message);
	}
}

// New Cookie
if (input.startsWith(prefix + "COOKIE ")) {
	if (message.author.id != '126516587258707969') return;
	let cookie = message.content.substring(message.content.indexOf(" ")+1);
	message.delete();
	try {
		Roblox.cookieLogin(cookie,message);
	} catch(err) {
		DiscFunc.sendMessage(message,err);
	}
}

// New Code
if (input.startsWith(prefix + "CODE ")) {
	if (message.author.id != '126516587258707969') return;
	let code = message.content.substring(message.content.indexOf(" ")+1);
	message.delete();
	try {
		Roblox.twoFactorAuth(code,message);
	} catch(err) {
		DiscFunc.sendMessage(message,err);
	}
}

// clayman0
if (message.author.id == '312285113952108555' && !(input.startsWith(prefix))) {
	let str = message.content;
	str = str.replace(/@everyone/g, '@ everyone');
	str = str.replace(/@here/g, '@ here');
	DiscFunc.sendMessage(message,"<@312285113952108555> said:\n" + message.content);
	message.delete();
}

// restart - Force a crash
if (input.startsWith(prefix + "RESTART")) {
	if (message.author.id != '126516587258707969') return;
	let botStatus = {} 
	botStatus.status = 'invisible'
	bot.user.setPresence(botStatus).catch(err => {log(err)}); 
	DiscFunc.sendMessage(message,"Restarting...");
	throw "===== RESTARTING =====";
}

// Verify
/*
if (input == prefix + "VERIFYTEST") {
	if (message.author.id != "126516587258707969") return;
	DiscFunc.sendMessage(message,"Verify test");
	Verify.main(message);
}
*/

});

bot.login(config.auth);