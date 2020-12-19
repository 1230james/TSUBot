// Account verification command
"use strict";

// Libraries
var https = require("https");

// =====================================================================================================================

function main(message, args, bot) {
    // Guilds only
    if (message.channel.type != "text") {
        message.channel.send("You can only use this command in a normal text channel in a server!");
        bot.util.log(message, "Attempted to verify outside of server.");
        return;
    }
    
    // -force
    if (args[0] == "-force") {
        message.channel.send("**" + message.member.displayName + "**, please head to <https://blox.link/verify>, sign in"
            + " at the __upper-right__ by pressing `Sign in with Discord`, select any TSU Discord server, and follow"
            + " the instructions to verify your Roblox account. Be sure to set it as your __primary account__ - I need"
            + " you to do that in order to work properly!\n\nOnce you're finished, come back and say `!verify`.");
        bot.util.log(message, "Forced verification instructions.");
        return;
    }
    
    message.channel.send("Hello, **" + message.member.displayName + "**! Please wait while I retrieve and process your"
        + " Roblox account information...");
    bot.util.log(message, "Began verification process.");
    bot.util.verifyUser(message, bot, message.author.id);
}

// =====================================================================================================================

module.exports = {
    command: "verify",
    aliases: ["getroles"],
    hasArgs: true,
    func:    main
}