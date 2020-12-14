// Get a table of TSU ranks

const https = require("https");

// =====================================================================================================================

/** Takes in a Roblox UserID and retrieves the ranks of that user in every TSU group, then returns those ranks in
  * a table. The keys of the table returned will match those listed for the group IDs in `config.json`. Results are NOT
  * cached (by design), so any subsequent calls will always contact Roblox and pull the latest information as available
  * through Roblox's web API endpoints.
  * @param Roblox noblox.js module. Require in main script then pass it in.
  * @param groupIDs the table of group IDs from `config.json`.
  * @param userID string or number matching the Roblox UserID of the desired player. 
  * @returns A Promise that passes a table (dictionary) containing the numerical rank values of the player in
  * every TSU group.
*/
function main(Roblox, groupIDs, userID) {
    return new Promise((resolve, reject) => {
        // Prepare variables
        let t         = {};
        let groupKeys = {};
        let options   = {
            "host":    "groups.roblox.com",
            "path":    "/v2/users/" + userID + "/groups/roles",
            "headers": {
                "Content-Type": "application/json"
            }
        };
        
        // Fill groupKeys + t
        for (let key in groupIDs) {
            groupKeys[groupIDs[key]] = key;
            t[key] = 0; // ok im not gonna horizontally align here
        }
        
        // Web request
        let req = https.request(options, (res) => {
            res.on("data", (chunk) => {
                let data = JSON.parse(chunk).data;
                
                // Fill out t
                for (let groupObj of data) {
                    let key = groupKeys[groupObj.group.id];
                    if (key) {
                        t[key] = getRank(groupObj);
                    }
                }
                
                // Return
                return resolve(t);
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
    name: "getTSURanks",
    func: main
}