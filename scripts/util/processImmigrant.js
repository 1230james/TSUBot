// Process immigration
"use strict";

// =====================================================================================================================

/** Takes in a `Message`, reads the `Message` contents as a Roblox username, then processes that user as an immigrant,
  * i.e. it will determine if they're a Foreign Immigrant in the main TSU group, and then update their rank to Prisoner,
  * Citizen, or Distinguished Citizen, if necessary. Based on certain results of the function's execution, the bot will
  * react to the `Message` passed with one of several emotes to indicate to the end user whether processing was
  * successful, if one of the failure cases is reached (see below), or if an unexpected error occurred.
  *
  * List of failure cases that the bot fully expects and has an output to the end user for:
  *     • The contents of the `Message` don't equal a valid Roblox username.
  *     • The user found was not a Foreign Immigrant.
  *     • The user found is not a member of the main group.
  * All other errors are handled non-fatally, but should be considered abnormal and be dealt with as if it potentially
  * were a fatal error.
  *
  * Additionally, any message whose first character is a forward slash ('/') will be ignored.
  *
  * @param message A `Message`. Must be a Message from a guild. Its entire contents will be treated as a Roblox
  * username. `Message`s whose contents do not contain a valid Roblox username are handled gracefully.
  * @param bot The `bot` from the main thread.
*/
async function main(message, bot) {
    // Check for slash
    if (message.content.startsWith('/')) return;
    
    // Prep
    let stopExecution = false;
    let clockReaction = await message.react('🕒');
    bot.util.log(message, "Processing immigrant: " + message.content);
    
    // Get UserID
    let userID = await bot.util.getRobloxUserIDFromUsername(message.content).catch((err) => {
        stopExecution = handleAwaitErr(message, clockReaction, err, "Error occurred while fetching UserID from username:");
    });
    if (stopExecution) return;
    
    // Handle unknown user
    if (!userID) {
        bot.util.log(message, message.content + " is not a valid username.");
        reactWithStatus(message, 3, clockReaction);
        return;
    }
    
    // Get TSU ranks
    let ranks = await bot.util.getTSURanks(bot.util.config.groupIDs, userID).catch((err) => {
        stopExecution = handleAwaitErr(message, clockReaction, err, "Error occurred while fetching TSU ranks:");
    });
    if (stopExecution) return;
    
    // Process bad main group ranks
    let rank = ranks.MAIN;
    if (rank > 10) { // Above FI
        reactWithStatus(message, 1, clockReaction);
        bot.util.log(message, message.content + " was not an immigrant.");
        return;
    }
    if (rank < 1) { // Guest
        reactWithStatus(message, 2, clockReaction);
        bot.util.log(message, message.content + " was not in the main group.");
        return;
    }
    
    // Get prisoner + DC statuses
    let statusResult  = await bot.util.trelloFuncs.getStatus(userID, bot.util).catch((err) => {
        stopExecution = handleAwaitErr(message, clockReaction, err,
            "Error occurred while fetching prisoner + DC statuses:");
    });
    if (stopExecution) return;
    
    let isDC       = statusResult[0];
    let isPrisoner = statusResult[1];
    if (isPrisoner) {
        rank = 20; // reuse rank variable
    } else {
        rank = (isDC) ? 40 : 30;
    }
    
    // Process immigration
    await bot.util.Roblox.setRank(4396304, userID, rank).catch((err) => {
        stopExecution = handleAwaitErr(message, clockReaction, err, "Error occurred while updating main group rank:");
    });
    if (stopExecution) return;
    
    // Log + ACK
    bot.util.log(message, "Successfully processed " + message.content + ". New rank: " + rank);
    reactWithStatus(message, 0, clockReaction);
}

/* Error handling for await function catch statements.
 * Returns `true`; use it to update the value of `stopExecution`. */
function handleAwaitErr(message, clockReaction, err, logMsg) {
    message.channel.send("<@126516587258707969> " + logMsg + "\n" + err);
    bot.util.log(message, logMsg);
    console.error(err);
    reactWithStatus(message, 4, clockReaction);
    return true;
}

/* Helper function to react to the specified message given a status number. `clockReaction`, is the `MessageReaction`
 * the bot adds to the message to indicate to the user that their request is actively being processed, which, at the
 * time of writing, was a clock emote.
 *
 * Valid statuses:
 * 0: Immigrant processing successful
 * 1: Player found, not FI
 * 2: Player found, is Guest
 * 3: Player not found
 * 4: Unexpected error
*/
function reactWithStatus(message, status, clockReaction) {
    // Remove clockReaction
    clockReaction.remove();
    
    // Pick the emote
    let emote = '';
    switch(status) {
    case 0:
        emote = '✅';
        break;
    case 1:
        emote = '❌';
        break;
    case 2:
        emote = '🖕';
        break;
    case 3:
        emote = '❓';
        break;
    case 4:
        emote = '🛠';
    }
    
    // React
    message.react(emote);
}

// =====================================================================================================================

module.exports = {
    name: "processImmigrant",
    func: main
}
