// Handle TSU Discord Roles - Guild Functions
"use strict";

/* The plan:
   1. Take in Discord user (via message.author) and table of TSU ranks
   2. Iterate over config.guildIDs.
   3. For every server the user is in, determine which roles need to be added to the user in that server and which ones
      need to be removed based on their TSU rank for the group that corresponds to that server.
*/

// This file is going to be extremely atrocious to look at, and I'm really sorry.
// I am fully aware that hardcoding a bunch of stuff like this is really suboptimal,
// but what are you going to do, reject my job application??? B)

// =====================================================================================================================

function transferBetweenArrays(toArr, fromArr, val) {
    let index = fromArr.indexOf(val);
    if (index < 0) return;
    toArr.push( fromArr.splice( index, 1 )[0] );
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
                if (ranks.MAIN >= 80) {
                    transferBetweenArrays(arrs[0], arrs[1], "485552201775972362");
                }
            }
            // SAF
            else if (ranks.MAIN >= 50) {
                transferBetweenArrays(arrs[0], arrs[1], "485552300744769537");
                if (ranks.MAIN >= 60) {
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
    
    // =================================================================================================================
    
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
    
    // =================================================================================================================
    
    // Admission Discord
    ADM: function(ranks) {
        let arrs = [[],[
            "495829249178075136", // Verified
            "495827201959395360", // Minister
            "495827348147535873", // Dep. Minister
            "495827567849504780", // Manager
            "495827583414304768", // CI
            "495827601768841226", // CS
            "495827617736556545", // Supervisor
            "495827636346683392", // VI
            "495827656697446400", // SI
            "495827673206226955", // Inspector
            "495827688678752286", // JI
            "495827712674365440", // PI
            "772262693628805151", // Trainee
            "495837466348093450", // High Command
            "495837489118838795", // High Rank
            "495837500468887552"  // Middle Rank
        ]];
        
        // HC
        if (ranks.ADM >= 90) {
            transferBetweenArrays(arrs[0], arrs[1], "495837466348093450");
            switch(ranks.ADM) {
            case 110:
                transferBetweenArrays(arrs[0], arrs[1], "495827201959395360");
                break;
            case 100:
                transferBetweenArrays(arrs[0], arrs[1], "495827348147535873");
                break;
            case 90:
                transferBetweenArrays(arrs[0], arrs[1], "495827567849504780");
            }
        }
        
        // HR
        else if (ranks.ADM >= 70) {
            transferBetweenArrays(arrs[0], arrs[1], "495837489118838795");
            switch(ranks.ADM) {
            case 80:
                transferBetweenArrays(arrs[0], arrs[1], "495827583414304768");
                break;
            case 70:
                transferBetweenArrays(arrs[0], arrs[1], "495827601768841226");
            }
        }
        
        // MR
        else if (ranks.ADM >= 40) {
            transferBetweenArrays(arrs[0], arrs[1], "495837500468887552");
            switch(ranks.ADM) {
            case 60:
                transferBetweenArrays(arrs[0], arrs[1], "495827617736556545");
                break;
            case 50:
                transferBetweenArrays(arrs[0], arrs[1], "495827636346683392");
                break;
            case 40:
                transferBetweenArrays(arrs[0], arrs[1], "495827656697446400");
            }
        }
        
        // LR + Verified Adm
        if (ranks.ADM > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "495829249178075136");
            switch(ranks.ADM) {
            case 30:
                transferBetweenArrays(arrs[0], arrs[1], "495827673206226955");
                break;
            case 20:
                transferBetweenArrays(arrs[0], arrs[1], "495827688678752286");
                break;
            case 10:
                transferBetweenArrays(arrs[0], arrs[1], "495827712674365440");
                break;
            case 5:
                transferBetweenArrays(arrs[0], arrs[1], "772262693628805151");
            }
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // SAF Discord
    SAF: function(ranks) {
        let arrs = [[],[
            "499283969821507584", // Verified
            "499263781734711297", // MoD
            "499263782380371978", // Army Marshal 
            "499263782422446091", // Navy Marshal
            "499263783462502421", // AF Marshal
            
            "499263783982596097", // Army CO
            "499263784582381599", // Navy CO
            "499263784662204426", // AF CO
            
            "499263784767062057", // Army
            "499263785899655185", // Navy
            "499263785958244352", // AF
            "855986800992583731", // Enlist
            
            "544350978443444225", // HC
            "544347031380951051"  // HR
        ]];
        let isEnlist = true;
        
        // Army
        if (ranks.SAF_ARM > 10) {
            isEnlist = false;
            transferBetweenArrays(arrs[0], arrs[1], "499263784767062057");
            if (ranks.SAF_ARM >= 50) {
                if (ranks.SAF_ARM == 70) {
                    transferBetweenArrays(arrs[0], arrs[1], "499263782380371978");
                } else {
                    transferBetweenArrays(arrs[0], arrs[1], "499263783982596097");
                }
            }
        }
        
        /*
        // Navy
        if (ranks.SAF_NAV > 10) {
            isEnlist = false;
            transferBetweenArrays(arrs[0], arrs[1], "499263785899655185");
            
        }
        
        // Air Force
        if (ranks.SAF_AIR > 10) {
            isEnlist = false;
            transferBetweenArrays(arrs[0], arrs[1], "499263785958244352");
            
        }
        */
        
        // Verified SAF
        if (ranks.SAF > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "499283969821507584");
            if (isEnlist) {
                transferBetweenArrays(arrs[0], arrs[1], "855986800992583731");
            }
            if (ranks.SAF >= 50) { // HRs
                if (ranks.SAF >= 80) { // Marshals+
                    transferBetweenArrays(arrs[0], arrs[1], "544350978443444225");
                } else { // COs
                    transferBetweenArrays(arrs[0], arrs[1], "544347031380951051");
                }
            }
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // Army Discord
    SAF_ARM: function(ranks) {
        let arrs = [[],[
            "772405296790372352", // Verified
            "851898163954319401", // MoD
            "772405695765020672", // Marshal
            "851890790061047808", // HICOM
            "852022839523147817", // SCO
            "851889500808675390", // CO
            "851885861380292668", // NCO
            "851881028419321906", // Ranker
            "855986262343024681", // Enlists
            "852695638960635915", // 86th Rifle Officer (NCO+ in this case)
            "851892550021414933", // 86th Rifle
        ]];
        
        // HC
        if (ranks.SAF_ARM >= 60) {
            transferBetweenArrays(arrs[0], arrs[1], "851890790061047808");
            switch(ranks.SAF_ARM) {
            case 80:
                transferBetweenArrays(arrs[0], arrs[1], "851898163954319401");
                break;
            case 70:
                transferBetweenArrays(arrs[0], arrs[1], "772405695765020672");
            default:
            }
        }
        
        // SCO
        else if (ranks.SAF_ARM >= 50) {
            transferBetweenArrays(arrs[0], arrs[1], "852022839523147817");
        }
        
        // CO
        else if (ranks.SAF_ARM >= 40) {
            transferBetweenArrays(arrs[0], arrs[1], "851889500808675390");
        }
        
        // NCO
        else if (ranks.SAF_ARM >= 30) {
            transferBetweenArrays(arrs[0], arrs[1], "851885861380292668");
        }
        
        // Ranker
        else if (ranks.SAF_ARM >= 20) {
            transferBetweenArrays(arrs[0], arrs[1], "851881028419321906");
        }
        
        // Enlist
        else {
            transferBetweenArrays(arrs[0], arrs[1], "855986262343024681");
        }
        
        // Verified Army
        if (ranks.SAF_ARM > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "772405296790372352");
        }
        
        // =====================================================================
        
        // Regiments
        if (ranks.SAF_ARM < 60) { // exclude HICOM
            // 86th Rifle
            if (ranks.ARM_86R > 0) {
                transferBetweenArrays(arrs[0], arrs[1], "851892550021414933");
                if (ranks.ARM_86R >= 60) {
                    transferBetweenArrays(arrs[0], arrs[1], "852695638960635915");
                }
            }
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // Militsiya Discord
    MIA: function(ranks) {
        let arrs = [[],[
            "499262798245789702", // Verified
            "510277849802997771", // CG
            "510675237352767488", // LG
            "510675234765144074", // MG
            "510675239550582821", // Colonel
            "510675241639346208", // LC
            "510675244009390080", // Major
            "510675246152417300", // Captain
            "510675248253894676", // SLt
            "510675250413961217", // Lt
            "510675252616101889", // JrLt
            "510675255002398730", // SWO
            "510675256709611541", // WO
            "510675259503017984", // SM
            "510675261763616778", // SS
            "510675263764561920", // Sergeant
            "510675265853063179", // JS
            "510675267954409482", // Private
            "682167918292762630", // Cadet
            "510673644922601492", // HC
            "510674685143547905", // HR
            "510674876097363990", // MR
        ]];
        
        // HC
        if (ranks.MIA >= 150) {
            transferBetweenArrays(arrs[0], arrs[1], "510673644922601492");
            switch(ranks.MIA) {
            case 170:
                transferBetweenArrays(arrs[0], arrs[1], "510277849802997771");
                break;
            case 160:
                transferBetweenArrays(arrs[0], arrs[1], "510675237352767488");
                break;
            case 150:
                transferBetweenArrays(arrs[0], arrs[1], "510675234765144074");
            }
        }
        
        // HR
        else if (ranks.MIA >= 120) {
            transferBetweenArrays(arrs[0], arrs[1], "510674685143547905");
            switch(ranks.MIA) {
            case 140:
                transferBetweenArrays(arrs[0], arrs[1], "510675239550582821");
                break;
            case 130:
                transferBetweenArrays(arrs[0], arrs[1], "510675241639346208");
                break;
            case 120:
                transferBetweenArrays(arrs[0], arrs[1], "510675244009390080");
            }
        }
        
        // MR
        else if (ranks.MIA >= 50) {
            transferBetweenArrays(arrs[0], arrs[1], "510674876097363990");
            switch(ranks.MIA) {
            case 110:
                transferBetweenArrays(arrs[0], arrs[1], "510675246152417300");
            case 100:
                transferBetweenArrays(arrs[0], arrs[1], "510675248253894676");
                break;
            case 90:
                transferBetweenArrays(arrs[0], arrs[1], "510675250413961217");
                break;
            case 80:
                transferBetweenArrays(arrs[0], arrs[1], "510675252616101889");
                break;
            case 70:
                transferBetweenArrays(arrs[0], arrs[1], "510675255002398730");
                break;
            case 60:
                transferBetweenArrays(arrs[0], arrs[1], "510675256709611541");
                break;
            case 50:
                transferBetweenArrays(arrs[0], arrs[1], "510675259503017984");
            }
        }
        
        // LR + Verified MIA
        if (ranks.MIA > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "499262798245789702");
            switch(ranks.MIA) {
            case 40:
                transferBetweenArrays(arrs[0], arrs[1], "510675261763616778");
                break;
            case 30:
                transferBetweenArrays(arrs[0], arrs[1], "510675263764561920");
                break;
            case 20:
                transferBetweenArrays(arrs[0], arrs[1], "510675265853063179");
                break;
            case 10:
                transferBetweenArrays(arrs[0], arrs[1], "510675267954409482");
                break;
            case 5:
                transferBetweenArrays(arrs[0], arrs[1], "682167918292762630");
            }
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // KGB Discord
    KGB: function(ranks) {
        let arrs = [[
            "509483970409398310", // Verified
        ],[
            "495791921076240394", // Chairman
            "495791967024971796", // VC
            "495791987299975168", // CA
            "495792002588344320", // SUP
            // "495792020372062219", // VO
            "495792039397425153", // O
            // "495792052156497920", // JO
            "495792067671359498", // SpA
            // "495792086394732574", // VA
            "495792100621680640", // SA
            "495792115276841025", // Agent
            "495792125531783171", // JA
            "495792144049766431", // Trainee
            "499040299633606656", // HC
            "499040325222793257", // HR
            "508324973790887946", // MR
            "495792203080400898", // LR
            "657702710874734599"  // Spetsnaz
        ]];

        // Spetsnaz role - do before guest check to let verified guests have spets role if they need it
        if (ranks.SPE > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "657702710874734599");
        }
        
        // Guest
        if (ranks.KGB < 1) {
            transferBetweenArrays(arrs[1], arrs[0], "509483970409398310");
            return arrs;
        }
        
        // HC
        if (ranks.KGB >= 100) {
            transferBetweenArrays(arrs[0], arrs[1], "499040299633606656");
            transferBetweenArrays(arrs[0], arrs[1], "499040325222793257"); // Give HC the HR role too
            switch(ranks.KGB) {
            case 130:
                transferBetweenArrays(arrs[0], arrs[1], "495791921076240394");
                break;
            case 120:
                transferBetweenArrays(arrs[0], arrs[1], "495791967024971796");
                break;
            case 110:
                transferBetweenArrays(arrs[0], arrs[1], "495791987299975168");
                break;
            case 100:
                transferBetweenArrays(arrs[0], arrs[1], "495792002588344320");
            }
        }
        
        // HR
        else if (ranks.KGB >= 70) {
            transferBetweenArrays(arrs[0], arrs[1], "499040325222793257");
            switch(ranks.KGB) {
            case 90:
                transferBetweenArrays(arrs[0], arrs[1], "495792020372062219");
                break;
            case 80:
                transferBetweenArrays(arrs[0], arrs[1], "495792039397425153");
                break;
            case 70:
                transferBetweenArrays(arrs[0], arrs[1], "495792052156497920");
            }
        }
        
        // MR
        else if (ranks.KGB >= 40) {
            transferBetweenArrays(arrs[0], arrs[1], "508324973790887946");
            switch(ranks.KGB) {
            case 60:
                transferBetweenArrays(arrs[0], arrs[1], "495792067671359498");
                break;
            case 50:
                transferBetweenArrays(arrs[0], arrs[1], "495792086394732574");
                break;
            case 40:
                transferBetweenArrays(arrs[0], arrs[1], "495792100621680640");
            }
        }
        
        // LR
        else if (ranks.KGB > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "495792203080400898");
            switch(ranks.KGB) {
            case 30:
                transferBetweenArrays(arrs[0], arrs[1], "495792115276841025");
                break;
            case 20:
                transferBetweenArrays(arrs[0], arrs[1], "495792125531783171");
                break;
            case 10:
                transferBetweenArrays(arrs[0], arrs[1], "495792144049766431");
            }
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // Red Guard Discord
    RG: function(ranks) {
        let arrs = [[
            "509444711124303892", // Verified
        ],[
            "502599832104337421", // Commander
            "502609448150237185", // Captain
            "502609450964746240", // Officer
            "502609461324546058", // OIT
            "678652005073289226", // DG
            "502609479771226133", // VG
            "502609484431228929", // SG
            "502609489976098816", // RG
            "678651988787068949", // JG
            "502609492609990666", // Inductee
            "502610272712785920", // HC
            "502612742386221057", // HR
            "502610323505938432", // MR
            "502610358800875533"  // LR
        ]];
        
        // Guest
        if (ranks.RG < 1) {
            transferBetweenArrays(arrs[1], arrs[0], "509444711124303892");
            return arrs;
        }
        
        // HC
        if (ranks.RG >= 60) {
            transferBetweenArrays(arrs[0], arrs[1], "502610272712785920");
            transferBetweenArrays(arrs[0], arrs[1], "502612742386221057"); // Give HC the HR role too
            switch(ranks.RG) {
            case 70:
                transferBetweenArrays(arrs[0], arrs[1], "502599832104337421");
                break;
            case 60:
                transferBetweenArrays(arrs[0], arrs[1], "502609448150237185");
            }
        }
        
        // HR
        else if (ranks.RG >= 48) {
            transferBetweenArrays(arrs[0], arrs[1], "502612742386221057");
            switch(ranks.RG) {
            case 50:
                transferBetweenArrays(arrs[0], arrs[1], "502609450964746240");
                break;
            case 48:
                transferBetweenArrays(arrs[0], arrs[1], "502609461324546058");
            }
        }
        
        // MR
        else if (ranks.RG >= 30) {
            transferBetweenArrays(arrs[0], arrs[1], "502610323505938432");
            switch(ranks.RG) {
            case 45:
                transferBetweenArrays(arrs[0], arrs[1], "678652005073289226");
                break;
            case 40:
                transferBetweenArrays(arrs[0], arrs[1], "502609479771226133");
                break;
            case 30:
                transferBetweenArrays(arrs[0], arrs[1], "502609484431228929");
            }
        }
        
        // LR
        else if (ranks.RG > 0) {
            transferBetweenArrays(arrs[0], arrs[1], "502610358800875533");
            switch(ranks.RG) {
            case 20:
                transferBetweenArrays(arrs[0], arrs[1], "502609489976098816");
                break;
            case 15:
                transferBetweenArrays(arrs[0], arrs[1], "678651988787068949");
                break;
            case 10:
                transferBetweenArrays(arrs[0], arrs[1], "502609492609990666");
            }
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // Spetsnaz Discord
    SPE: function(ranks) {
        let arrs = [[
            "505871854171455489", // Verified
        ],[
            "505871059451641866", // CO
            "505871176560541713", // XO
            "505871191769088011", // Chief Op
            "505871762035310593", // Alfa
            "505871763515637780", // Vympel
            "808849519276982312", // Smerch
            "790066447165816844", // Operative
            "531595277941997589"  // Trainee
        ]];
        
        // Guests
        if (ranks.SPE < 1) {
            transferBetweenArrays(arrs[1], arrs[0], "505871854171455489");
            return arrs;
        }
        
        switch(ranks.SPE) {
        case 60:
            transferBetweenArrays(arrs[0], arrs[1], "505871059451641866");
            break;
        case 50:
            transferBetweenArrays(arrs[0], arrs[1], "505871176560541713");
            break;
        case 40:
            transferBetweenArrays(arrs[0], arrs[1], "505871191769088011");
            break;
        case 30:
            transferBetweenArrays(arrs[0], arrs[1], "505871762035310593");
            break;
        case 20:
            transferBetweenArrays(arrs[0], arrs[1], "505871763515637780");
            break;
        case 18:
            transferBetweenArrays(arrs[0], arrs[1], "808849519276982312");
            break;
        case 15:
            transferBetweenArrays(arrs[0], arrs[1], "790066447165816844");
            break;
        case 10:
            transferBetweenArrays(arrs[0], arrs[1], "531595277941997589");
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // Comms Discord
    MOC: function(ranks) {
        let arrs = [[
            "510680711460683776"  // Verified
        ],[
            "510679418520469524", // Minister
            "510680082633850901", // Dep. Minister
            "510679448614469661", // Manager
            "510679463554711556", // CR
            "510679466792583169", // DR
            "510679651039969303", // SR
            "510679652994646016", // Reporter
            "510679654525566996", // JR
            "510679656442363904"  // PI
        ]];
        
        // Guests
        if (ranks.MOC < 1) {
            transferBetweenArrays(arrs[1], arrs[0], "510680711460683776");
            return arrs;
        }
        
        switch(ranks.MOC) {
        case 90:
            transferBetweenArrays(arrs[0], arrs[1], "510679418520469524");
            break;
        case 80:
            transferBetweenArrays(arrs[0], arrs[1], "510680082633850901");
            break;
        case 70:
            transferBetweenArrays(arrs[0], arrs[1], "510679448614469661");
            break;
        case 60:
            transferBetweenArrays(arrs[0], arrs[1], "510679463554711556");
            break;
        case 50:
            transferBetweenArrays(arrs[0], arrs[1], "510679466792583169");
            break;
        case 40:
            transferBetweenArrays(arrs[0], arrs[1], "510679651039969303");
            break;
        case 30:
            transferBetweenArrays(arrs[0], arrs[1], "510679652994646016");
            break;
        case 20:
            transferBetweenArrays(arrs[0], arrs[1], "510679654525566996");
            break;
        case 10:
            transferBetweenArrays(arrs[0], arrs[1], "510679656442363904");
        }
        
        // Return
        return arrs;
    },
    
    // =================================================================================================================
    
    // Justice Discord
    MOJ: function(ranks) {
        let arrs = [[
            "615247450877198336"  // Verified
        ],[
            "615247449061064717", // Chairman
            "615247809557430282", // VC
            "615248060770942995", // SCJ
            "615249424922312773", // PG
            "615249427329712128", // CP
            "615249443515531385", // PJ
            "615249445596168208", // PA
            "615249429280194576", // Procurator
            "615249441154269215", // DA
            "615249447387004988", // Intern
            "615247986074583040"  // Supreme Court
        ]];
        
        // Guests
        if (ranks.MOJ < 1) {
            transferBetweenArrays(arrs[1], arrs[0], "615247450877198336");
            return arrs;
        }
        
        // SCOTSU
        if (ranks.MOJ >= 80) {
            transferBetweenArrays(arrs[0], arrs[1], "615247986074583040");
        }
        
        switch(ranks.MOJ) {
        case 100:
            transferBetweenArrays(arrs[0], arrs[1], "615247449061064717");
            break;
        case 90:
            transferBetweenArrays(arrs[0], arrs[1], "615247809557430282");
            break;
        case 80:
            transferBetweenArrays(arrs[0], arrs[1], "615248060770942995");
            break;
        case 70:
            transferBetweenArrays(arrs[0], arrs[1], "615249424922312773");
            break;
        case 60:
            transferBetweenArrays(arrs[0], arrs[1], "615249427329712128");
            break;
        case 50:
            transferBetweenArrays(arrs[0], arrs[1], "615249443515531385");
            break;
        case 40:
            transferBetweenArrays(arrs[0], arrs[1], "615249445596168208");
            break;
        case 30:
            transferBetweenArrays(arrs[0], arrs[1], "615249429280194576");
            break;
        case 20:
            transferBetweenArrays(arrs[0], arrs[1], "615249441154269215");
            break;
        case 10:
            transferBetweenArrays(arrs[0], arrs[1], "615249447387004988");
        }
        
        // Return
        return arrs;
    }
}
