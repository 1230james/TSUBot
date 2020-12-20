// Verify Discord User in TSU Discord servers
"use strict";

var robloxIDs = {}; // [string discordSnowflake]: string robloxUserID

// =====================================================================================================================

/** Takes in a Discord snowflake, or user ID, and updates their roles in all TSU Discord servers and, if necessary,
  * fixes group ranks. If the Discord user specified is not verified with Bloxlink, it will provide instructions to the
  * specified channel instead.
  * @param message A `Message`. Must be a Message from a guild. Ideally, it should be the one that contains the verify
  * command. If the user specified is not verified with Bloxlink, verification instructions will be sent to the channel
  * this message is located in.
  * @param bot The `bot` from the main thread.
  * @param userID string or number matching the Discord snowflake (user id) of the Discord user to be verified.
  * @param forceQuery boolean value. If `true`, a query will be sent to Bloxlink's API to retrieve the Roblox UserID of
  * the specified user, regardless of whether the bot has cached it. If `false` or otherwise falsy, a query will be sent
  * to Bloxlink iff the bot has not cached the Roblox UserID of the specified user.
*/
function main(message, bot, userID, forceQuery) {
    // Discord user id -> Roblox UserID
    bot.util.log(message, "Fetching Roblox UserID.");
    
    // Forced Query or value wasn't cached yet
    if (forceQuery || !robloxIDs[userID]) {
        bot.util.log(message, "ID not cached this session or forceQuery is true - sending request to Bloxlink.");
        bot.util.getRobloxUserID(bot.util, userID).then((robloxID) => {
            robloxIDs[userID] = robloxID;
            processRobloxID(message, bot, robloxID); // we're gonna be chaining Promises together, so...
        }).catch((err) => {
            bot.util.log(message, "Error occurred while trying to fetch Roblox UserID during verification:");
            console.error(err);
            // message below is hardcoded to ping me so ik when stuff happens - if you forked this bot, you should change
            // the line, and every other line that does a similar thing.
            message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
                + " later.\n\n<@126516587258707969> Roblox UserID fetch error:\n" + err);
        });
    } else {
        let robloxID = robloxIDs[userID]
        bot.util.log(message, "ID is cached for this session - ID: " + robloxID);
        processRobloxID(message, bot, robloxID);
    }
}

function processRobloxID(message, bot, robloxID) {
    bot.util.log(message, "Processing Roblox UserID.");
    switch(robloxID) {
    case -1:
        message.channel.send("**" + message.member.displayName + "**, I could not find a Roblox account linked to your"
            + " Discord account.\nPlease head to <https://blox.link/verify>, sign in at the __upper-right__ by pressing"
            + " `Sign in with Discord`, select any TSU Discord server, and follow the instructions to verify your"
            + " Roblox account. Be sure to set it as your __primary account__ - I need you to do that in order to work"
            + " properly!\n\nOnce you're finished, come back and say `!verify` again.");
        bot.util.log(message, "Attempted to fetch Roblox UserID, but found none. Sent verification instructions.");
        break;
    case -2:
        message.channel.send("**" + message.member.displayName + "**, there are too many verification requests being sent"
            + " at this time by you and/or other users. Please wait one minute, then try again.");
        bot.util.log(message, "Attempted to fetch Roblox UserID, but Bloxlink rate limit was reached.");
        break;
        
    // Roblox UserID -> TSU group ranks
    default:
        bot.util.log(message, "Fetching TSU ranks.");
        bot.util.getTSURanks(bot.util.Roblox, bot.util.config.groupIDs, robloxID).then((ranks) => {
            validateGroupRanks(message, bot, robloxID, ranks);
        }).catch((err) => {
            bot.util.log(message, "Error occurred while trying to fetch TSU ranks during verification:");
            console.error(err);
            message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
                + " later.\n\n<@126516587258707969> TSU ranks fetch error:\n" + err);
        });
    }
}

function validateGroupRanks(message, bot, robloxID, ranks) {
    // TSU ranks -> TSU ranks but with main group rank checked
    bot.util.log(message, "Validating main group rank.");
    bot.util.validateTSURank(robloxID, bot.util, ranks).then((validatedRanks) => {
        processGroupRanks(message, bot, robloxID, validatedRanks);
    }).catch((err) => {
        bot.util.log(message, "Error occurred while trying to validate TSU main group rank during verification:");
        console.error(err);
        message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
            + " later.\n\n<@126516587258707969> TSU main group rank validation error:\n" + err);
    });
}

function processGroupRanks(message, bot, robloxID, ranks) {
    // checked TSU ranks -> Discord roles
    bot.util.log(message, "Assigning Discord roles.");
    bot.util.handleTSUDiscordRoles(message, bot, ranks).then(() => {
        processUsername(message, bot, robloxID);
    }).catch((err) => {
        bot.util.log(message, "Error occurred while trying to process TSU ranks during verification:");
        console.error(err);
        message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
            + " later.\n\n<@126516587258707969> TSU Discord roles handling error:\n" + err);
    });
}

function processUsername(message, bot, robloxID) {
    // Roblox UserID -> Discord nickname
    bot.util.log(message, "Updating Discord nicknames.");
    bot.util.handleTSUDiscordNicknames(message, bot, robloxID).then((username) => {
        bot.util.log(message, "Successfully verified and updated all roles in TSU Discord servers.");
        message.channel.send("**" + username + "**, you have been verified and all your roles have been"
            + " updated in all the TSU Discord servers you are in. Welcome!");
    }).catch((err) => {
        bot.util.log(message, "Error occurred while trying to update nickname in TSU Discords:");
        console.error(err);
        message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Your roles have been"
            + " updated in all the TSU Discord servers you are in, but your nickname has not been in one or more of"
            + " these servers.\n\n<@126516587258707969> TSU Discord nickname handling error:\n" + err);
    });
}

// =====================================================================================================================

module.exports = {
    name: "verifyUser",
    func: main
}