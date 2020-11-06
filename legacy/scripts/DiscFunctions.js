// Variables
const Discord = require("discord.js");
const prefix = "!";
const database = require("../database.json");
const databackup = require("../tempdata.json");
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
	console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
};
const fs = require("fs");

// ================================================
	
// Database Write
module.exports.db = function(arr,val) {
	databackup[arr] = val
	database[arr] = val
	fs.writeFileSync('./tempdata.json', JSON.stringify(databackup, null, 2));
	fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
}

module.exports.updateFile = function(filename,val) {
	log("Writing to " + filename);
	fs.writeFileSync("./"+filename+".json", JSON.stringify(val, null, 4));
	if (filename == "database" && Date.now() - database["BACKUP"] > 604800000) {
		database["BACKUP"] = Date.now();
		fs.writeFileSync("../database - Copy.json", JSON.stringify(val, null, 4));
	}
	log("Write done!");
}

// Send Message
module.exports.sendMessage = function(message,msg,logm) {
	message.channel.send(msg)
	if (logm) { // If log (the parameter) is null, then don't log something in the console
		if (message.channel.type === 'text') { // Text channel vs DM check
			log('[' + message.guild.name + ', @' + message.author.username + ', #' + message.channel.name + ']: ' + logm)
		} else if (message.channel.type === 'dm') {
			log('[@' + message.author.username + ', a DM]: ' + logm)
		}
	}
}

// Send DM
module.exports.sendDM = function(message,msg,logm) {
	message.author.send(msg)
	if (logm) {
		if (message.channel.type === 'text') {
			log('[' + message.guild.name + ', @' + message.author.username + ', #' + message.channel.name + ']: ' + logm)
		} else if (message.channel.type === 'dm') {
			log('[@' + message.author.username + ', a DM]: ' + logm)
		}
	}
}

// Set Roles
module.exports.setDiscordRole = function(member,newRoles,oldRoles) { //newRoles and oldRoles must be ARRAYS with role ids to add/remove respectively
	console.log("Retrieving discord roles...");
	var userRoles = [];
	var rolesMap = member.roles;
	
	console.log("Filtering discord roles...");
	for (var [key, val] of rolesMap) { // This is for iterating Maps in JS. In this case, we're just spitting out all the keys into an array.
		userRoles.push(key);
	}
	
	for (i=0; i < userRoles.length; i++) { // See Mikhail's code for comments
		for (j=0; j < oldRoles.length; j++) { 
			if (userRoles[i] == oldRoles[j])
				userRoles.splice(i,1) // .splice() is a mutator method
		}
	}
	
	console.log("Adding new discord roles...");
	for (k=0; k < newRoles.length; k++) {
		userRoles.push(newRoles[k]);
	}
	
	console.log("Checking for Verified...");
	var isVerified = false;
	for (l=0; l < userRoles.length; l++) {
		if (userRoles[l] == '395557285180473356') isVerified = true;
	}
	if (isVerified == false) {
		console.log("Adding verified...");
		userRoles.push('395557285180473356');
	}
	
	console.log("Setting discord roles...");
	member.setRoles(userRoles);
}

// Get Role ID
module.exports.getRoleID = function(roleName) { // roleName should be a string; returns role ID number of the given role
	let allRoles = bot.guilds.get('336615403197300736').roles.array();
	for (let role of allRoles) {
		if (role.name == roleName)
			return role.id;
	}
	return 0;
}