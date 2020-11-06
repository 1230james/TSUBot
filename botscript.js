// TSUBot by James "1230james" Hyun
"use strict";

// Libraries & Important Variables
const config = require("./config.json");
const fs = require("fs");

const Discord = require("discord.js");
const bot = new Discord.Client();
bot.cmds = new Map();
bot.util = new Map();

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

// Misc. Functions
// placeholder

// =============================================================================

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
    console.log("Discord is ready!");
    
    // Login to Roblox
    // placeholder
    // console.log("Roblox is ready!");
});

// =============================================================================

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
                cmdObj.func(message);
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

// =============================================================================

// Login to Discord
bot.login(config.auth);
