// Accept application
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
        bot.util.log(message, "Attempted to accept an application, but provided no user.");
        return;
    }
    
    // Post ACK
    bot.util.log(message, "Accepting " + args[0] + "'s application.");
    let msg = await message.channel.send("Accepting " + args[0] + "'s application...");
    
    // Retrieve Roblox UserID
    let userID = await bot.util.getRobloxUserIDFromUsername(args[0]).catch((err) => {
        msg.edit("An error occurred when trying to accept " + args[0] + "'s application:\n" + err);
        bot.util.log(message, "Error occurred when fetching Roblox UserID via username:");
        console.error(err);
        stopExecution = true;
    });
    if (stopExecution) return;
    
    // Handle nonexistent user
    if (!userID) {
        msg.edit("No user by the name of " + args[0] + " was found.\nDid you spell it correctly?");
        bot.util.log(message, "Attempted to accept application from " + args[0] + ", but user does not exist.");
        return;
    }
    
    // Accept into group
    await bot.util.Roblox.handleJoinRequest(bot.util.config.groupIDs[divKey], userID, true).catch((err) => {
        stopExecution = true;
        
        // No join request
        if (err.message.includes("join request is invalid")) {
            msg.edit("No join request from " + args[0] + " was found.");
            bot.util.log(message, "Tried to accept " + args[0] + "'s application, but a join request was not found.");
            return;
        }
        
        // Actual error
        msg.edit("An error occurred while accepting application.");
        message.channel.send("<@126516587258707969>\n" + err);
        bot.util.log(message, "Error occurred while accepting user into group:");
        console.error(err);
    });
    if (stopExecution) return;
    
    // Mark as read
    let result = await bot.util.applications.markAsRead(bot, bot.util.dbSheet, userID, divKey).catch((err) => {
        msg.edit("An error occurred while accepting application.");
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
        msg.edit("Accepted " + args[0] + "'s application!");
        bot.channels.cache.get(bot.util.config.appLogChannelID).send(
            "**__Applicant__:** " + await getProperUsername(bot, userID, args[0])
            + "\n**Division:** " + bot.util.config.divNames[divKey]
            + "\n**Status:** Accepted ✅"
        );
        bot.util.log(message, "Accepted " + args[0] + "'s application.");
        break;
        
    // Successful execution, but no app found
    case 1:
        msg.edit("No application found from " + args[0] + ".\nDid you enter the correct username?");
        bot.util.log(message, "Tried to accept " + args[0] + "'s application, but none was found.");
    }
}

/* Retrieves the Roblox username of the account specified by the UserID passed. If some error occurs, the value
 * passed for `fallback` will be returned instead. */
function getProperUsername(bot, userID, fallback) {
    return new Promise(async (resolve) => {
        let stop = false;
        let name = await bot.util.getRobloxUsername(userID).catch((err) => {
            stop = true;
        });
        if (stop || !name) return resolve(fallback);
        return resolve(name);
    });
}

// =====================================================================================================================

module.exports = {
    command: "accept",
    aliases: null,
    hasArgs: true,
    func:    main
}
