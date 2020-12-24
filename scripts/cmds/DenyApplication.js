// Deny application
"use strict";

// =====================================================================================================================

async function main(message, args, bot) {
    let stopExecution = false;
    
    // App channels only
    let divKey = bot.util.config.appChannels[message.channel.id];
    if (!divKey) {
        return; // reject silently
    }
    
    // No args
    if (args[0] == "") {
        message.channel.send("**" + message.member.displayName + "**, you need to specify a user to locate an"
            + " application from.");
        bot.util.log(message, "Attempted to deny an application, but provided no user.");
        return;
    }
    
    // Post ACK
    bot.util.log(message, "Denying " + args[0] + "'s application.");
    let msg = await message.channel.send("Denying " + args[0] + "'s application...");
    
    // Retrieve Roblox UserID
    let userID = await bot.util.getRobloxUserIDFromUsername(args[0]).catch((err) => {
        msg.edit("An error occurred when trying to deny " + args[0] + "'s application:\n" + err);
        bot.util.log(message, "Error occurred when fetching Roblox UserID via username:");
        console.error(err);
        stopExecution = true;
    });
    if (stopExecution) return;
    
    // Handle nonexistent user
    if (!userID) {
        msg.edit("No user by the name of " + args[0] + " was found.\nDid you spell it correctly?");
        bot.util.log(message, "Attempted to deny application from " + args[0] + ", but user does not exist.");
        return;
    }
    
    // Mark as read
    let result = await bot.util.applications.markAsRead(bot, bot.util.dbSheet, userID, divKey).catch((err) => {
        msg.edit("An error occurred while denying application.");
        message.channel.send("<@126516587258707969>\n" + err);
        bot.util.log(message, "Error occurred while marking application as read:");
        console.error(err);
        stopExecution = true;
    });
    if (stopExecution) return;
    
    // Handle result
    switch(result) {
    // Deleted successfully
    case 0:
        msg.edit("Denied " + args[0] + "'s application.");
        bot.channels.cache.get(bot.util.config.appLogChannelID).send(
            "**Applicant:** " + args[0]
            + "\n**Division:** " + bot.util.config.divNames[divKey]
            + "\n**Status:** Denied"
        );
        bot.util.log(message, "Denied " + args[0] + "'s application.");
        break;
    // Successful execution, but no app found
    case 1:
        msg.edit("No application found from " + args[0] + ".\nDid you enter the correct username?");
        bot.util.log(message, "Tried to deny " + args[0] + "'s application, but none was found.");
    }
}

// =====================================================================================================================

module.exports = {
    command: "deny",
    aliases: null,
    hasArgs: true,
    func:    main
}
