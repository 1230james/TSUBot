// Validate SAF group ranks
"use strict";

// ====================================================
// ========== THIS IS NOT validateTSURank.js ==========
// ===== Check yourself before you wreck yourself =====
// ====================================================

// =====================================================================================================================

/** Takes in a Roblox UserID and a TSU ranks table, then based on the contents of the table, it will validate the SAF
  * group rank and fix it if there's a discrepancy. If their SAF group rank isn't correct, it will send a request to
  * Roblox's web API (via noblox.js) to fix it. It will also run a check on each branch of the SAF, comparing the SAF
  * branch rank with its respective regiments, and correcting ranks in the branch as needed. Ranks in regiments are
  * checked first before the SAF group rank is to ensure everything is properly tabluated. **Note that this is NOT the
  * `validateTSURank` function.**
  * @param userID A string or number matching the Roblox UserID of the user to fix the SAF group rank of if a request
  * to Roblox needs to be made. Ideally, it should match the UserID used to construct the value passed for `ranks` (see
  * below), but there is no check to ensure that they match.
  * @param util `bot.util`.
  * @param ranks Output of `bot.util.getTSURanks`'s Promise.
  * @returns A Promise that will output `ranks`, possibly with changes. No copy is explicitly constructed during
  * execution of this function. If their SAF group rank or any ranks in the SAF branches need to be updated, the
  * corresponding values in the `ranks` table will be updated.
*/
function main(userID, util, ranks) {
    return new Promise(async function(resolve, reject) {
        // Preliminary checks
        if (ranks.SAF == 0) return resolve(ranks); // Can't update their rank in a group if they're not in it, so why even bother
        
        // Branches check
        let rank = await processBranchRank(userID, util, ranks);
        
        // Update rank on Roblox if there's a mismatch
        if (rank != ranks.SAF) {
            ranks.SAF = rank;
            util.Roblox.setRank(4396451, userID, rank).then(() => {
                return resolve(ranks);
            }).catch((err) => {
                return reject(err);
            });;
        } else {
            return resolve(ranks);
        }
    });
}

// Returns the proper SAF group rank for a given ranks table
async function processBranchRank(userID, util, ranks) {
    // Validate branch ranks first
    ranks = await validateBranchRanks(userID, util, ranks);
    
    // ok now we go
    let rank = 10; // Assume Enlist by default
    
    // DP+ check
    if (ranks.MAIN >= 150) {
        switch(ranks.MAIN) {
            case 255:
                return 255;
            case 200:
                return 200;
            case 150:
                return 190;
        }
    }
    
    // MoD check
    if (ranks.SAF == 110) {
        return 110;
    }
    
    // Army officer check
    if (ranks.SAF_ARM >= 50) {
        if (ranks.SAF_ARM == 70) {
            rank = 100; // Army Marshal
        } else {
            rank = 70;  // Army regiment COs+
        }
    }
    
    /*
    // Navy officer check
    else if (ranks.SAF_NAV >= 255) {
        if (ranks.SAF_ARM == 255) {
            rank = 90; // Navy Marshal
        } else {
            rank = 60;  // Navy regiment COs+
        }
    }
    
    // Air Force officer check
    else if (ranks.SAF_AIR >= 255) {
        if (ranks.SAF_AIR == 255) {
            rank = 80; // Air Force Marshal
        } else {
            rank = 50;  // Air Force regiment COs+
        }
    }
    */
    
    // Ranker check
    else if (ranks.SAF_ARM > 10) {
        rank = 40;
    } /* else if (ranks.SAF_NAV > 10) {
        rank = 30;
    } else if (ranks.SAF_AIR > 10) {
        rank = 20;
    }
    */
    
    return rank;
}

// Checks ranks in regiment groups and validates ranks in branch groups
function validateBranchRanks(userID, util, ranks) {
    return new Promise(async function(resolve, reject) {
        try {
            // Validate Army rank
            ranks = await validateABranchRank(userID, util, ranks, "SAF_ARM", {
                "regimentKeys": ["ARM_86R"],
                "branchRanks":  [
                    {"rank": 255, "minRegimentRank": 255}, // General Secretary
                    {"rank": 200, "minRegimentRank": 210}, // Premier
                    {"rank": 190, "minRegimentRank": 200}, // Deputy Premier
                    {"rank":  80, "minRegimentRank": 170}, // MoD
                    {"rank":  70, "minRegimentRank": 160}, // Marshal
                    {"rank":  60, "minRegimentRank": 140}, // Hicom (Major General+)
                    {"rank":  50, "minRegimentRank": 110}, // SCO (Major+)
                    {"rank":  40, "minRegimentRank":  90}, // CO (Lieutenant+)
                    {"rank":  30, "minRegimentRank":  60}, // NCO (Senior Sergeant+)
                    {"rank":  20, "minRegimentRank":  20}, // Rankers (Private+)
                    {"rank":  10, "minRegimentRank":   1}  // Enlists
                ]
            });
        
            // Validate Navy and Air Force ranks... eventually
        } catch(err) {
            return reject(err);
        }
        
        return resolve(ranks);
    });
}
function validateABranchRank(userID, util, ranks, branchKey, info) {
    return new Promise(async function(resolve, reject) {
        // Preliminary checks
        if (ranks[branchKey] == 0) return resolve(ranks);
        
        // Regiments check
        let rank = 0;
        for (let key of info.regimentKeys) { // check all regiments
            for (let rankInfo of info.branchRanks) { // loop stops at the highest branch rank they deserve from this regiment
                if (ranks[key] == 0) continue; // skip regiments they're not in
                if (rank < rankInfo.rank && ranks[key] >= rankInfo.minRegimentRank) {
                    rank = rankInfo.rank;
                    break;
                }
            }
        }
        
        // Update rank on Roblox if there's a mismatch
        if (rank != ranks[branchKey]) {
            ranks[branchKey] = rank;
            try {
                await util.Roblox.setRank(util.config.groupIDs[branchKey], userID, rank);
                return resolve(ranks);
            } catch(err) {
                return reject(err);
            }
        } else {
            return resolve(ranks);
        }
    });
}

// =====================================================================================================================

module.exports = {
    name: "validateSAFRank",
    func: main
}
