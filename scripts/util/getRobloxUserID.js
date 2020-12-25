// Get the Roblox UserID of a user based on their Discord user snowflake.
"use strict";

// Uses Bloxlink's verification database.
// Only checks for a primary account and ignores any server-specific accounts. This is intentional as is part of an
// effort to combat lazy attempts at using alts.

// If you forked this bot and need server-specific account verification, the place you want to be editing is the
// request(resolve, reject, options) function.

const https       = require("https");
const RateLimiter = require("limiter").RateLimiter;

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
            "host":    "api.blox.link",
            "path":    "/v1/user/" + userID,
            "headers": {
                "Content-Type": "application/json"
            }
        };
        
        // Web request
        limiter.removeTokens(1, (err) => {
            if (err) {
                console.error(err);
                return resolve(-2);
            }
            return request(resolve, reject, options);
        });
    });
}

function request(resolve, reject, options) {
    let req = https.request(options, (res) => {
        res.on("data", (chunk) => {
            // Parse response
            if (chunk.includes("ratelimited")) {
                return resolve(-2);
            }
            let data = JSON.parse(chunk);
            
            // Interpret it
            if (data.status == "ok") {
                return resolve(parseInt(data.primaryAccount));
            } else if (data.status == "error") {
                // these are very stupid but i'm lazy af rn
                if (data.error == "This user is not linked with Bloxlink.") {
                    return resolve(-1);
                } else if (data.error.includes("not have a primary account")) {
                    return resolve(-1);
                }
                return reject(data.error);
            }
            
            // We should never be here, but if we have, then something's gone VERY wrong
            // ...or the API got updated
            return reject("Uninterpretable response received from server. Received status: " + data.status);
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
