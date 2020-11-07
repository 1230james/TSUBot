// TSUBot by James "1230james" Hyun
"use strict";

// Libraries & Important Variables
const fs            = require("fs");
const Roblox        = require("noblox.js");
const Discord       = require("discord.js");
const node-schedule = require("node-schedule");

var config = require("./config.json");
const bot  = new Discord.Client();
bot.cmds   = new Map();
bot.util   = new Map();

// =====================================================================================================================

// Load in all the commands
const commandFiles = fs.readdirSync(__dirname + "/scripts/cmds")
    .filter(file => file.endsWith(".js"));
for (let file of commandFiles) {
    let cmd = require(__dirname + "/scripts/cmds/" + file);
    bot.cmds.set(cmd.command, cmd);
    
    if (cmd.aliases != null) { // Type safety? What's that? :^)
        for (let alias of cmd.aliases) { // I love you pass by reference
            bot.cmds.set(alias, bot.cmds.get(cmd.command)); 
        }
    }
}

// Load in utilities
const utilityFiles = fs.readdirSync(__dirname + "/scripts/util")
    .filter(file => file.endsWith(".js"));
for (let file of utilityFiles) {
    let util = require(__dirname + "/scripts/util/" + file);
    bot.util.set(util.name, util);
}

// =====================================================================================================================

// Misc. Functions
// Log in to Roblox with the cookie passed.
function robloxLogin(cookie) { // wow this looks kinda messy
    (new Promise((resolve, reject) => {
        try {
            Roblox.setCookie(cookie);
        } catch(err) {
            reject(err);
        }
        resolve();
    })).then(() => {
        // Signs of life
        bot.util.setRobloxStatus(Roblox, "Verified online at " + (new Date()).toUTCString()).then(res => {
            if (res.statusCode == 200) {
                bot.util.glog("Roblox is ready!");
            } else {
                bot.util.glog("Setting Roblox status failed - returned " + res.statusCode);
            }
        }).catch(err => {
            console.err(err);
        });
        
        // Save cookie
        if (!config.roblox) {
            config.roblox = {};
        }
        config.roblox.cookie = cookie;
        fs.writeFile("config.json", JSON.stringify(config, null, 4), (err) => {
            if (err) {
                console.error("Error when writing cookie to config file.\n" + err);
            }
        });
    }).catch(err => {
        console.error(err);
    });
}

// =====================================================================================================================

// Stuff to run once bot is initially online
bot.on("ready", () => {
    // Set status
    let presenceData = {};
    if (config.devMode) {
        presenceData.status = "idle";
        presenceData.activity = {
            type: "PLAYING",
            name: "Development Mode - I may be dysfunctional"
        }
    } else {
        presenceData.status = "online";
        presenceData.activity = {
            type: "PLAYING",
            name: "City of Volinsk, Soviet Border"
        }
    }
    bot.user.setPresence(presenceData).catch(err => { console.log(err) });
    
    // Set avatar
        // TODO
    
    // Print to console
    bot.util.glog("Discord is ready!");
    
    // Login to Roblox
    if (config.roblox && config.roblox.cookie) {
        robloxLogin(config.roblox.cookie);
    } else {
        bot.util.glog("Roblox is NOT ready - could not find a cookie in the config file!");
    }
});

// =====================================================================================================================

// Stuff to run whenever a message is sent
bot.on("message", function(message) {
    // Prevent people who arent supposed to use the bot from using it
    if (message.author.bot) return;
    if (config.devMode && message.author.id != "126516587258707969") return;
    
    // Passive stuff
    // Placeholder
    
    // One-time vars
    let prefix = "!";
    
    // Command processing
    processCommand(prefix, message);
});

function processCommand(prefix, message) {
    let input = message.content.toLowerCase();
    bot.cmds.forEach(function(cmdObj, cmd) {
        // Match command
        let prefixAndCmd = prefix + cmd;
        if (input.substring(0, prefixAndCmd.length) == prefixAndCmd) {
            if (canRunCommand(prefixAndCmd, input, cmdObj)) {
                cmdObj.func(message, bot.util);
            }
        }
    });
}

function canRunCommand(prefixAndCmd, input, cmdObj) {
    return argsCheck(prefixAndCmd, input, cmdObj);
    // maybe I can put more stuff here later idk
}

function argsCheck(prefixAndCmd, input, cmdObj) {
    if (cmdObj.hasArgs) { // If this command is expecting arguments
        if (input.length == prefixAndCmd.length) { 
            return true; // If the message only contains the command, run command
        }
        if (input.substring(0, prefixAndCmd.length + 1) == prefixAndCmd + " ") {
            return true; // If whitespace separates the command and the first argument, run command
        }
        return false;
    } else { // If this comand is NOT expecting args
        return (input.length == prefixAndCmd.length); // run command iff input matches the command
    }
}

// =====================================================================================================================

// Login to Discord
bot.login(config.auth);

// Hourly status update
const statusUpdateJob = nodeSchedule.scheduleJob("00 * * * *", () => { // "00 * * * *" = Every hour at 0th minute
	bot.util.setRobloxStatus(Roblox, "Verified online at " + (new Date()).toUTCString()).then(res => {
        if (res.statusCode == 200) {
            bot.util.glog("Updated online timestamp on Roblox status.");
        } else {
            bot.util.glog("Setting Roblox status failed - returned " + res.statusCode);
        }
    }).catch(err => {
        console.err(err);
    });
});
