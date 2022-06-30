// Get the Roblox UserID of a user based on their Discord user snowflake.
"use strict";

// Uses Bloxlink's verification database.
// Only checks for a primary account and ignores any server-specific accounts. This is intentional as is part of an
// effort to combat lazy attempts at using alts.

// If you forked this bot and need server-specific account verification, the place you want to be editing is the
// request(resolve, reject, options) function.

const https       = require("https");
const RateLimiter = require("limiter").RateLimiter;

const keys = require("../../keys.json"); // TODO: Something better than this hacky garbage solution

const limiter = new RateLimiter(60, "minute");

var robloxIDs = {}; // [string discordSnowflake]: string robloxUserID

// =====================================================================================================================

/** Takes in a Discord snowflake, or user ID, and fetches the UserID of the primary Roblox account tied to the account
  * the snowflake belongs to by checking Bloxlink's servers. This method will turn up empty-handed if the Discord user
  * has not verified with Bloxlink or if they haven't set a primary account with Bloxlink.
  * @param userID string or number matching the Discord snowflake (user id) of the Discord user whose Roblox account you
  * want to find.
  * @param forceQuery Any type, but ideally boolean. If `true` or otherwise truthy, a query will be sent to Bloxlink's
  * API to retrieve the Roblox UserID of the specified user, regardless of whether the bot has cached it. Else, a query
  * will be sent to Bloxlink iff the bot has not cached the Roblox UserID of the specified user.
  * @returns A Promise that passes the UserID of the primary Roblox account of the Discord user passed in, if one was
  * found. If none was found, -1 is passed. If we are being rate-limited, -2 is passed.
*/
function main(userID, forceQuery) {
    return new Promise((resolve, reject) => {
        // Handle forceQuery
        if (!forceQuery) {
            if (robloxIDs[userID]) {
                return resolve(robloxIDs[userID]);
            }
        }
        
        // Set up options
        let options = {
            "host":    "v3.blox.link",
            "path":    "/developer/discord/" + userID,
            "headers": {
                "Content-Type": "application/json",
                "api-key":      keys.bloxlink
            }
        };
        
        // Web request
        limiter.removeTokens(1, (err) => {
            if (err) {
                console.error(err);
                return resolve(-2);
            }
            return request(resolve, reject, options, userID);
        });
    });
}

function request(resolve, reject, options, userID) {
    let req = https.request(options, (res) => {
        res.on("data", (chunk) => {
            // Parse response
            if (chunk.includes("ratelimited")) {
                return resolve(-2);
            }
            let data = JSON.parse(chunk);
            
            // Interpret it
            if (data.success === true) { // first and last time I use triple equals
                if (data.user.primaryAccount == null) { // not verified or no primary account set
                    return resolve(-1);
                }
                let robloxID      = parseInt(data.user.primaryAccount);
                robloxIDs[userID] = robloxID
                return resolve(robloxID);
            } else {
                return reject("Server responded with: " + data.reason);
            }
            
            // We should never be here, but if we have, then something's gone VERY wrong
            // ...or the API got updated
            return reject("Uninterpretable response received from server.");
        });
    });
    req.on("error", (e) => {
        return reject(e);
    });
    req.end();
}

// =====================================================================================================================

module.exports = {
    name: "getRobloxUserID",
    func: main
}
