// Validate main group rank
"use strict";

// =====================================================================================================================

/** Takes in a Roblox UserID and a TSU ranks table, then based on the contents of the table, it will validate the main
  * group rank and fix it if there's a discrepancy. For example, it will make sure that someone who is a member of the
  * KGB's main group rank is Ministry Employee (or Ministry Officer if they're an HR in KGB). If their main group rank
  * isn't correct, it will send a request to Roblox's web API (via noblox.js) to fix it.
  * @param userID A string or number matching the Roblox UserID of the user to fix the main group rank of if a request
  * to Roblox needs to be made. Ideally, it should match the UserID used to construct the value passed for `ranks` (see
  * below), but there is no check to ensure that they match.
  * @param util `bot.util`.
  * @param ranks Output of `bot.util.getTSURanks`'s Promise.
  * @returns A Promise that will output `ranks`, possibly with changes. No copy is explicitly constructed during
  * execution of this function. If their main group rank needs to be updated, `ranks.MAIN` will be written to with the
  * updated value.
*/
function main(userID, util, ranks) {
    return new Promise(async function(resolve, reject) {
        // Preliminary checks
        if (ranks.MAIN >= 90) return resolve(ranks); // If they're in CPSU then we don't care - pray that I didn't mess up handling someone's CPSU ranks though
        if (ranks.MAIN ==  0) return resolve(ranks); // Can't update their rank in a group if they're not in it, so why even bother
        
        // Employee check
        let rank = processEmployeeRank(ranks);
        
        // If not employee, check citizenship + prisoner status
        if (rank == 30) {
            if (ranks.MAIN == 25) return resolve(ranks); // If they're a foreign diplomat, leave their rank alone
            
            let statusResult = await util.trelloFuncs.getStatus(userID, util);
            let isDC         = statusResult[0];
            let isPrisoner   = statusResult[1];
            
            if (isPrisoner) {
                rank = 20;
            } else {
                if (ranks.MAIN == 10) {
                    rank = 10; // If they're a Foreign Immigrant, leave their rank alone (no free citizenship, duh)
                } else {
                    rank = (isDC) ? 40 : 30;
                }
            }
        }
        
        // Update rank on Roblox if there's a mismatch
        if (rank != ranks.MAIN) {
            ranks.MAIN = rank;
            util.Roblox.setRank(4396304, userID, rank).then(() => {
                return resolve(ranks);
            }).catch((err) => {
                return reject(err);
            });;
        }
        return resolve(ranks);
    });
}

// Returns the proper main group rank for a given ranks table
function processEmployeeRank(ranks) {
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
}

// =====================================================================================================================

module.exports = {
    name: "validateTSURank",
    func: main
}