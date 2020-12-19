// Handle TSU Discord Roles - Guild Functions
"use strict";

/* The plan:
   1. Take in Discord user (via message.author) and table of TSU ranks
   2. Iterate over config.guildIDs.
   3. For every server the user is in, determine which roles need to be added to the user in that server and which ones
      need to be removed based on their TSU rank for the group that corresponds to that server.
*/

// This file is going to be extremely atrocious to look at, and I'm really sorry

// =====================================================================================================================

function transferBetweenArrays(toArr, fromArr, val) {
    toArr.push( fromArr.splice( fromArr.indexOf(val), 1 )[0] );
}

/** Dictionary defining functions to execute based on keys from the `getTSURanks` table.
  * Each function will the ranks table.
  * Each function must return an array containing two arrays, where the first subarray indicates roles to be added and
  * the second indicates the roles to be removed, and both arrays contain 0 or more Role snowflake strings. */
module.exports = {
    // Main Discord
    MAIN: function(ranks) {
        let arrs = [[
            "485528187158396938"  // Verified - everyone is gonna get it anyway, so let's put it here
        ],[
            "485528154379780097", // GS
            "485533517430652928", // Premier
            "485533895605878801", // DP
            "485533952237633536", // CC
            "485548882621759499", // Politburo
            "485549372923314197", // Secretariat
            "485549226495967257", // CoM
            "543326038252453919", // Party Member
            "539258057201287204", // CPSU
            "485552201775972362", // MO
            "485552243500777485", // ME
            "485552265868869645", // AFO
            "485552300744769537", // SAF
            "485558089094004740", // DC
            "485558195851362305", // SC
            "616016875360616448", // Diplomat
            "485560098433794051", // Prisoner
            "485558215912980501", // FI
            "486363544640684065", // Guest
            "533122113285128203"  // Bio
        ]];
        
        // CPSU+
        if (ranks.MAIN >= 90) {
            transferBetweenArrays(arrs[0], arrs[1], "539258057201287204");
            let role = "543326038252453919"; // assume Party Member by default
            switch(ranks.MAIN) {
            case 100:
                role = "485549226495967257";
                break;
            case 120:
                role = "485549372923314197";
                break;
            case 130:
                role = "485548882621759499";
                break;
            case 140:
                role = "485533952237633536";
                break;
            case 150:
                role = "485533895605878801";
                break;
            case 200:
                role = "485533517430652928";
                break;
            case 255:
                role = "485528154379780097";
                break;
            }
            transferBetweenArrays(arrs[0], arrs[1], role);
        }
        
        // Not CPSU
        else {
            // Ministry Employees
            if (ranks.MAIN >= 70) {
                transferBetweenArrays(arrs[0], arrs[1], "485552243500777485");
                if (rank.MAIN >= 80) {
                    transferBetweenArrays(arrs[0], arrs[1], "485552201775972362");
                }
            }
            // SAF
            else if (ranks.MAIN >= 50) {
                transferBetweenArrays(arrs[0], arrs[1], "485552300744769537");
                if (rank.MAIN >= 80) {
                    transferBetweenArrays(arrs[0], arrs[1], "485552265868869645");
                }
            }
            // Everyone else
            else {
                let role = "486363544640684065"; // assume Guest
                switch(ranks.MAIN) {
                case 40:
                    role = "485558089094004740";
                    break;
                case 30:
                    role = "485558195851362305";
                    break;
                case 25: 
                    role = "616016875360616448";
                    break;
                case 20:
                    role = "485560098433794051";
                    break;
                case 10:
                    role = "485558215912980501";
                }
                transferBetweenArrays(arrs[0], arrs[1], role);
            }
        }
        
        // Bio
        if (ranks.BIO > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "533122113285128203");
        }
        
        // Return
        return arrs;
    },
    
    // CPSU Discord
    CPSU: function(ranks) {
        let arrs = [[
            "488796997923373093"  // Verified
        ],[
            "488792108279267338", // GS
            "488792222784028674", // Premier
            "488792237275217920", // DP
            "488796359676133376", // CC
            "488796375568613376", // Politburo
            "488796402739183616", // Secretariat
            "488796703365922826", // CoM
            "543693692117057566"  // Party Member
        ]];
        
        // grrr no stinky non-CPSU allowed :angry:
        if (ranks.MAIN < 90) {
            transferBetweenArrays(arrs[1], arrs[0], "488796997923373093");
            return arrs;
        }
        
        // CC+
        if (ranks.MAIN >= 140) {
            transferBetweenArrays(arrs[0], arrs[1], "488796359676133376");
            switch(ranks.MAIN) {
            case 255:
                transferBetweenArrays(arrs[0], arrs[1], "488792108279267338");
                break;
            case 200:
                transferBetweenArrays(arrs[0], arrs[1], "488792222784028674");
                break;
            case 150:
                transferBetweenArrays(arrs[0], arrs[1], "488792237275217920");
            }
        }
        
        // Party Member - Politburo
        else {
            switch(ranks.MAIN) {
            case 130:
                transferBetweenArrays(arrs[0], arrs[1], "488796375568613376");
                break;
            case 120:
                transferBetweenArrays(arrs[0], arrs[1], "488796402739183616");
                break;
            case 100:
                transferBetweenArrays(arrs[0], arrs[1], "488796703365922826");
                break;
            case 90:
                transferBetweenArrays(arrs[0], arrs[1], "543693692117057566");
            }
        }
        
        // CoM double-check (for people above CoM but need the role b/c they're a minister)
        if (ranks.MAIN > 100) {
            let isCoM = false; // oh boy here comes the if chain :^|
            if (ranks.ADM == 110) isCoM = true;
            if (ranks.SAF == 160) isCoM = true;
            if (ranks.MIA == 170) isCoM = true;
            if (ranks.KGB == 130) isCoM = true;
            if (ranks.RG  ==  70) isCoM = true;
            if (ranks.SPE ==  60) isCoM = true;
            if (ranks.MOC ==  90) isCoM = true;
            if (ranks.MOJ == 100) isCoM = true;
            if (ranks.BIO ==  90) isCoM = true;
            if (isCoM) {
                transferBetweenArrays(arrs[0], arrs[1], "488796703365922826");
            }
        }
        
        // Return
        return arrs;
    },
    
    // Admission Discord
    ADM: function(ranks) {
        console.log("Called ADM guild func");
        return [[],[]];
    },
    
    // SAF Discord
    SAF: function(ranks) {
        console.log("Called SAF guild func");
        return [[],[]];
    },
    
    // Militsiya Discord
    MIA: function(ranks) {
        console.log("Called MIA guild func");
        return [[],[]];
    },
    
    // KGB Discord
    KGB: function(ranks) {
        console.log("Called KGB guild func");
        return [[],[]];
    },
    
    // Red Guard Discord
    RG: function(ranks) {
        console.log("Called RG guild func");
        return [[],[]];
    },
    
    // Spetsnaz Discord
    SPE: function(ranks) {
        console.log("Called SPE guild func");
        return [[],[]];
    },
    
    // Comms Discord
    MOC: function(ranks) {
        console.log("Called MOC guild func");
        return [[],[]];
    },
    
    // Justice Discord
    MOJ: function(ranks) {
        console.log("Called MOJ guild func");
        return [[],[]];
    }
}