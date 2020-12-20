// Account verification command
"use strict";

// =====================================================================================================================

function main(message, args, bot) {
    // Guilds only
    if (message.channel.type != "text") {
        message.channel.send("You can only use this command in a normal text channel in a server!");
        bot.util.log(message, "Attempted to verify outside of server.");
        return;
    }
    
    message.channel.send("Hello, **" + message.member.displayName + "**! Please wait while I retrieve and process your"
        + " Roblox account information...");
    bot.util.log(message, "Began verification process.");
    
    // -force
    if (args[0] == "-force") {
        bot.util.verifyUser(message, bot, message.author.id, true);
    } else {
        bot.util.verifyUser(message, bot, message.author.id, false);
    }
}

// =====================================================================================================================

module.exports = {
    command: "verify",
    aliases: ["getroles"],
    hasArgs: true,
    func:    main
}