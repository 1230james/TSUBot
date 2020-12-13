// TSUBot by James "1230james" Hyun
"use strict";

// Libraries & Important Variables
const fs           = require("fs");
const Roblox       = require("noblox.js");
const Discord      = require("discord.js");

const config    = require("./config.json");
var   keys      = require("./keys.json");
const startDate = (new Date()).toISOString().substring(0, 10);

const bot = new Discord.Client();
bot.cmds  = {};
bot.util  = {
    "Roblox": Roblox,
    "config": config
};

// =====================================================================================================================

// Load in all the commands
const commandFiles = fs.readdirSync(__dirname + "/scripts/cmds")
    .filter(file => file.endsWith(".js"));
for (let file of commandFiles) {
    let cmd = require(__dirname + "/scripts/cmds/" + file);
    bot.cmds[cmd.command] = cmd;
    
    if (cmd.aliases != null) { // Type safety? What's that? :^)
        for (let alias of cmd.aliases) { // I love you pass by reference
            bot.cmds[alias] = bot.cmds[cmd.command];
        }
    }
}

// Load in utilities
const utilityFiles = fs.readdirSync(__dirname + "/scripts/util")
    .filter(file => file.endsWith(".js"));
for (let file of utilityFiles) {
    let util = require(__dirname + "/scripts/util/" + file);
    bot.util[util.name] = util.func;
}

// =====================================================================================================================

// Misc. Functions

// Log in to Roblox with the cookie passed.
// Jesus christ this is messy as hell
function runAfterSetCookie(cookie) {
    // Signs of life
    bot.util.setRobloxStatus(Roblox, "Logged in on " + startDate + "; online for 0 hours").then(res => {
        if (res.status) {
            bot.util.glog("Roblox is ready!");
        } else {
            bot.util.glog("Setting Roblox status failed: " + res.errors[0].message);
        }
    }).catch(err => {
        bot.util.glog("Error occurred when trying to set Roblox status.");
        console.error(err);
    });
    
    // Save cookie
    keys.roblox = cookie;
    fs.writeFile("keys.json", JSON.stringify(keys, null, 4), (err) => {
        if (err) {
            throw err;
        }
    });
}
function robloxLogin(cookie) {
    (new Promise((resolve, reject) => {
        try {
            Roblox.setCookie(cookie).then(() => {
                runAfterSetCookie(cookie);
                resolve();
            }).catch(err => {
                return reject(err);
            });
        } catch(err) {
            return reject(err);
        }
    })).catch(err => {
        bot.util.glog("Error occurred when trying to call Roblox.setCookie()");
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
    if (keys.roblox) {
        robloxLogin(keys.roblox);
    } else {
        bot.util.glog("Roblox is NOT ready - could not find a cookie in the keys file!");
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
    for (let cmd in bot.cmds) {
        // Match command
        let prefixAndCmd = prefix + cmd;
        if (input.substring(0, prefixAndCmd.length) == prefixAndCmd) {
            if (canRunCommand(prefixAndCmd, input, bot.cmds[cmd])) {
                bot.cmds[cmd].func(message, bot.util);
            }
        }
    };
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
bot.login(keys.discord);

// Hourly status update
var hoursOnline = 0;
setInterval(function() {
    hoursOnline++;
    bot.util.setRobloxStatus(Roblox, "Logged in on " + startDate + "; online for " + hoursOnline + " hours")
    .then(res => {
        if (res.status) {
            bot.util.glog("Updated online time on Roblox status.");
        } else {
            bot.util.glog("Setting Roblox status failed: " + res.errors[0].message);
        }
    }).catch(err => {
        throw err;
    });
}, 3600000); // every 1 hour
