// View application
"use strict";

// =====================================================================================================================

async function main(message, args, bot) {
    // App channels only
    let divKey = bot.util.config.appChannels[message.channel.id];
    if (!divKey) {
        return; // reject silently
    }
    
    // No args
    if (args[0] == "") {
        message.channel.send("**" + message.member.displayName + "**, you need to specify a user to locate an"
            + " application from.");
        bot.util.log(message, "Attempted to view an application, but provided no user.");
        return;
    }
    
    // Post ACK
    bot.util.log(message, "Fetching " + args[0] + "'s application.");
    let msg = await message.channel.send("Fetching " + args[0] + "'s application. Please wait...");
    
    // Retrieve Roblox UserID
    let userID = await bot.util.getRobloxUserIDFromUsername(args[0]).catch((err) => {
        msg.edit("An error occurred when trying to fetch " + args[0] + "'s application:\n" + err);
        bot.util.log(message, "Error occurred when fetching Roblox UserID via username:");
        console.error(err);
        return;
    });
    
    // Handle nonexistent user
    if (!userID) {
        msg.edit("No user by the name of " + args[0] + " was found.\nDid you spell it correctly?");
        bot.util.log(message, "Attempted to fetch application from " + args[0] + ", but user does not exist.");
        return;
    }
    
    // Retrieve application
    let appStrings = await bot.util.applications.viewApp(bot, bot.util.dbSheet, userID, divKey).catch((err) => {
        msg.edit("An error occurred while retrieving application.");
        message.channel.send("<@126516587258707969>\n" + err);
        bot.util.log(message, "Error occurred while retrieving applicaton:");
        console.error(err);
        return;
    });
    
    // Handle nonexistent application
    if (!appStrings) {
        msg.edit("No application from " + args[0] + " was found.");
        bot.util.log(message, "Attempted to fetch application from " + args[0] + ", but application does not exist.");
        return;
    }
    
    // Print application
    msg.delete();
    let index = 0;
    let timer = setInterval(() => {
        message.channel.send(appStrings[index]);
        index++;
        if (index >= appStrings.length) {
            clearInterval(timer);
            bot.util.log(message, "Viewed " + args[0] + "'s application.");
        }
    }, 100);
}

// =====================================================================================================================

module.exports = {
    command: "view",
    aliases: null,
    hasArgs: true,
    func:    main
}
