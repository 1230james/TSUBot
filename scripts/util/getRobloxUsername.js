// Get a Roblox username based on a UserID.
"use strict";

const https = require("https");

// =====================================================================================================================

/** Takes in a Roblox UserID and retrieves the current username associated with that UserID, if available. Results are
  * NOT cached, so each call will make a request to Roblox and fetch the most current information available through
  * Roblox's web API endpoints.
  * @param userID string or number matching the Roblox UserID of the desired player. 
  * @returns A Promise that passes a string equaling the username, or null if none was found.
*/
function main(userID) {
    return new Promise((resolve, reject) => {
        // Prepare variables
        let options   = {
            "host":    "users.roblox.com",
            "path":    "/v1/users/" + userID,
            "headers": {
                "Content-Type": "application/json"
            }
        };
        
        // Web request
        let req = https.request(options, (res) => {
            res.on("data", (chunk) => {
                let data = JSON.parse(chunk);
                return resolve(data.name);
            });
        });
        req.on("error", (e) => {
            return reject(e);
        });
        req.end();
    });
}

/* Structure of groupObj:
{
    group: {
        id:          int,
        name:        string,
        memberCount: int
    },
    role: {
        id:   int,
        name: string,
        rank: int in range [1,255] matching the user's rank in the group
    }
} */
function getRank(groupObj) {
    return groupObj.role.rank;
}

// =====================================================================================================================

module.exports = {
    name: "getRobloxUsername",
    func: main
}
