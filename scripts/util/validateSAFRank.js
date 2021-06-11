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
    /* actually not yet b/c i haven't made the changes to SAF's ranks yet
    let rank   = 30; // Assume Citizen by default
    let rankME = 70; // Ministry Employee rank val
    let rankMO = 80; // Ministry Officer rank val
    
    // Check for ME/MO
    if (ranks.ADM >= 10) {
        rank = (ranks.ADM >= 70) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.MIA >= 10) {
        rank = (ranks.MIA >= 110) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.KGB >= 1) {
        rank = (ranks.KGB >= 70) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.RG  >= 1) {
        rank = (ranks.RG  >= 50) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.SPE >= 1) {
        rank = (ranks.SPE >= 40) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.MOC >= 1) {
        rank = (ranks.MOC >= 60) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.MOJ >= 1) {
        rank = (ranks.MOJ >= 60) ? rankMO : rankME;
    }
    if (rank < rankMO && ranks.BIO >= 1) {
        rank = (ranks.BIO >= 60) ? rankMO : rankME;
    }
    
    // Check SAF/AFO
    if (rank < rankMO && ranks.SAF >= 20) {
        if (ranks.SAF >= 70) { // If you're an officer in SAF, you get AFO.
            rank = 60;         // Overrides ME rank if the user would otherwise have Ministry Employee.
        } else if (rank < rankME) {
            rank = 50;         // SAF rank only if they're not an ME.
        }
    }
    return rank;
    */
    return ranks.SAF;
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
                    {"rank":  70, "minRegimentRank": 170}, // MoD
                    {"rank":  60, "minRegimentRank": 160}, // Marshal
                    {"rank":  50, "minRegimentRank": 140}, // Hicom (Major General+)
                    {"rank":  40, "minRegimentRank": 120}, // SCO (Lieutenant Colonel+)
                    {"rank":  30, "minRegimentRank":  90}, // CO (Lieutenant+)
                    {"rank":  20, "minRegimentRank":  60}, // NCO (Senior Sergeant+)
                    {"rank":  10, "minRegimentRank":   1}  // Rankers (all else)
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
                    rank = rankInfo.rank
                    break;
                }
            }
        }
        
        // Update rank on Roblox if there's a mismatch
        if (rank != ranks[branchKey]) {
            ranks[branchKey] = rank;
            try {
                return resolve(await util.Roblox.setRank(util.config.groupIDs[branchKey], userID, rank));
            } catch(err) {
                return reject(err);
            }
        }
        return resolve(ranks);
    });
}

// =====================================================================================================================

module.exports = {
    name: "validateSAFRank",
    func: main
}
