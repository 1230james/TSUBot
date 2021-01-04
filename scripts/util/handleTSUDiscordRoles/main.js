// Handle management of TSU Discord server roles
// Main script
"use strict";

const guildFuncs = require("./guildFuncs.js");

// =====================================================================================================================

function processMember(member, div, ranks) {
    return new Promise((resolve, reject) => {
        // Get array of arrays of roles
        let rolesArrs = guildFuncs[div](ranks);
        
        // Filter out roles to remove
        let currentRoles = member.roles.cache;
        let setRolesArr  = [];
        currentRoles.each((role) => {
            if (rolesArrs[1].indexOf(role.id) < 0) {
                setRolesArr.push(role.id);
            }
        });
        
        // Add in roles to add, if not already present
        for (let id of rolesArrs[0]) {
            if (setRolesArr.indexOf(id) < 0) {
                setRolesArr.push(id);
            }
        }
        
        // Set the roles
        member.roles.set(setRolesArr).then(() => {
            return resolve();
        }).catch((err) => {
            return reject(err);
        });
    });
}

// =====================================================================================================================

/** Takes in a Discord Message and a TSU ranks table, then based on the contents of the table, it will assign roles in
  * all TSU Discords for the Message's author.
  * @param message A `Message`. Ideally, it should be the one that contains the verify command. If the user specified is
  * not verified with Bloxlink, verification instructions will be sent to the channel this message is located in.
  * @param bot The `bot` from the main thread.
  * @param ranks Output of `bot.util.getTSURanks`'s Promise.
*/
module.exports = function(message, bot, ranks) {
    return new Promise((resolve, reject) => {
        // Prep variables
        let guildIDs = bot.util.config.guildIDs;
        let count    = 0; // it's either chaining a dozen promises together or the idiot way, so the idiot way it is
        let total    = Object.keys(guildIDs).length;
        
        for (let div in guildIDs) {
            // Fetch Guild object
            bot.guilds.fetch(guildIDs[div]).then((guild) => {
                // Get member
                guild.members.fetch(message.author.id).then((member) => {
                    processMember(member, div, ranks).then(() => {
                        count++;
                        if (count >= total) {
                            return resolve();
                        }
                        
                    }).catch((err) => { // https://gyazo.com/bbd521c542d2ff3cefbb0ff97d6746de
                        if (err.message.includes("Unknown Member")) {
                            count++;
                            if (count >= total) {
                                return resolve();
                            }
                        } else {
                            return reject(err);
                        }
                    });
                    
                }).catch(() => {
                    count++;
                    if (count >= total) {
                        return resolve();
                    }
                });
                
            }).catch((err) => {
                return reject(err);
            });
        }
    });
}
