// Verify Discord User in TSU Discord servers
"use strict";

// =====================================================================================================================

/** Takes in a Discord snowflake, or user ID, and updates their roles in all TSU Discord servers and, if necessary,
  * fixes group ranks. If the Discord user specified is not verified with Bloxlink, it will provide instructions to the
  * specified channel instead.
  * @param message A `Message`. Must be a Message from a guild. Ideally, it should be the one that contains the verify
  * command. If the user specified is not verified with Bloxlink, verification instructions will be sent to the channel
  * this message is located in.
  * @param bot The `bot` from the main thread.
  * @param userID string or number matching the Discord snowflake (user id) of the Discord user to be verified.
  * @param forceQuery boolean value. See documentation on `getRobloxUserID`.
*/
function main(message, bot, userID, forceQuery) {
    // Discord user id -> Roblox UserID
    bot.util.log(message, "Fetching Roblox UserID.");
    bot.util.getRobloxUserID(userID, forceQuery).then((robloxID) => {
        processRobloxID(message, bot, robloxID); // we're gonna be chaining Promises together, so...
    }).catch((err) => {
        bot.util.log(message, "Error occurred while trying to fetch Roblox UserID during verification:");
        console.error(err);
        // message below is hardcoded to ping me so ik when stuff happens - if you forked this bot, you should change
        // the line, and every other line that does a similar thing.
        message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
            + " later.\n\n<@126516587258707969> Roblox UserID fetch error:\n" + err);
    });
}

function processRobloxID(message, bot, robloxID) {
    bot.util.log(message, "Processing Roblox UserID.");
    switch(robloxID) {
    case -1:
        message.channel.send(`**${message.member.displayName}**, I could not find a Roblox account linked to you, or you did not set a primary account with Bloxlink.
Please head to <https://blox.link> to verify and set your primary account.

__Instructions__
• If you aren't already signed in, please click \`Sign in with Discord\` in the upper-right.
• Visit this page: <https://blox.link/verification/485528044828753940>
• Scroll down to \`Link A New Account To This Server\` and follow the instructions to verify your Roblox account.
• **Remember to CHECK the \`Set this as your primary account\` box!**
• Once complete, visit this page: <https://blox.link/account>, and double-check to make sure your primary account is set correctly.
• After you've finished everything above, come back here and say \`!verify -force\`.`);
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
        bot.util.getTSURanks(bot.util.config.groupIDs, robloxID).then((ranks) => {
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
    // TSU ranks -> TSU ranks but with group ranks checked
    bot.util.log(message, "Validating SAF group ranks.");
    bot.util.validateSAFRank(robloxID, bot.util, ranks).then((validatedRanks) => {
        bot.util.log(message, "Validating main group rank.");
        bot.util.validateTSURank(robloxID, bot.util, ranks).then((validatedRanks) => {
            processGroupRanks(message, bot, robloxID, validatedRanks);
            
        }).catch((err) => {
            bot.util.log(message, "Error occurred while trying to validate TSU main group rank during verification:");
            console.error(err);
            message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
                + " later.\n\n<@126516587258707969> TSU main group rank validation error:\n" + err);
        });
    }).catch((err) => {
        bot.util.log(message, "Error occurred while trying to validate TSU SAF group ranks during verification:");
        console.error(err);
        message.channel.send("I'm sorry **" + message.member.displayName + "**, but an error occured. Please try again"
            + " later.\n\n<@126516587258707969> TSU SAF group ranks validation error:\n" + err);
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
