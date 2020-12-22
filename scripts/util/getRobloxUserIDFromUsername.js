// Get the Roblox UserID of a user based on their Roblox username
"use strict";

const https = require("https");

// =====================================================================================================================

/** Takes in a Roblox username and fetches the UserID associated with that username from Roblox's web API, if able.
  * Works with past usernames, as Roblox's web API supports searching past usernames of users.
  * @param username string containing the username of the user whose UserID you want to fetch.
  * @returns A Promise that passes the UserID as a number if found, or `null` if not.
*/
function main(username) {
    return new Promise((resolve, reject) => {
        // Prepare variables
        let postData  = JSON.stringify({
            "usernames": [username]
        });
        let options   = {
            "host":    "users.roblox.com",
            "path":    "/v1/usernames/users",
            "method":  "POST",
            "headers": {
                "Content-Type":   "application/json",
                "Content-Length": Buffer.byteLength(postData)
            }
        };
        
        // Web request
        let req = https.request(options, (res) => {
            res.on("data", (chunk) => {
                let data = JSON.parse(chunk);
                if (data.data.length < 1) {
                    return resolve(null);
                }
                return resolve(data.data[0].id);
            });
        });
        req.on("error", (e) => {
            return reject(e);
        });
        req.write(postData);
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
    name: "getRobloxUserIDFromUsername",
    func: main
}
