// Handle management of TSU Discord server nicknames
"use strict";

// =====================================================================================================================

/** Takes in a Discord Message and a Roblox UserID. The nicknames of the author of the Message passed will be updated to
  * the username associated with the Roblox UserID in all TSU Discord servers.
  * @param message A `Message`. Ideally, it should be the one that contains the verify command. If the user specified is
  * not verified with Bloxlink, verification instructions will be sent to the channel this message is located in.
  * @param bot The `bot` from the main thread.
  * @param userID string or number matching the Roblox UserID of the desired player.
  * @returns A Promise that passes the Roblox username belonging to the UserID passed.
*/
function main(message, bot, userID) {
    return new Promise((resolve, reject) => {
        bot.util.getRobloxUsername(bot.util.Roblox, userID).then((username) => {
            // Prep variables
            let guildIDs = bot.util.config.guildIDs;
            let count    = 0; // it's either chaining a dozen promises together or the idiot way, so the idiot way it is
            let total    = Object.keys(guildIDs).length;
            
            for (let div in guildIDs) {
                // Fetch Guild object
                bot.guilds.fetch(guildIDs[div]).then((guild) => {
                    // Get member
                    guild.members.fetch(message.author.id).then((member) => {
                        count++; // putting it here to be fail-passive
                        member.setNickname(username).then(() => {
                            if (count >= total) {
                                return resolve(username);
                            }
                            
                        }).catch((err) => {
                            return reject(err);
                        });
                        
                    }).catch(() => {
                        count++;
                        if (count >= total) {
                            return resolve(username);
                        }
                    });
                    
                }).catch((err) => {
                    return reject(err);
                });
            }
        }).catch((err) => {
            return reject(err);
        });
    });
}

// =====================================================================================================================

module.exports = {
    name: "handleTSUDiscordNicknames",
    func: main
}