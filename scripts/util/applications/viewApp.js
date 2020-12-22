// Functions for TSU division application handling
// Retrieve application
"use strict";

// =====================================================================================================================

/* Accepts a string and returns an array of strings. The array returned will either contain only the string passed in,
 * or, if the string passed in was 2000 characters or more, will contain substrings of the string passed in, where each
 * substring is shorter than 2000 characters.
 *
 * firstMax is a number in the range [0, 2000] that allows you to define a limit less than 2000 characters for the max
 * allowable length of the first string. No safety checks are performed on firstMax; I trust that you're smart enough to
 * use it properly. */
function splitString(str, firstMax) {
    let arr  = [];
    let temp = str;
    
    // First pass, if firstMax is defined
    if (firstMax) {
        // More than firstMax characters remaining
        if (temp.length >= firstMax) {
            let end = temp.lastIndexOf(" ");
            arr[arr.length] = temp.substring(0, end);
            temp = temp.substring(end);
            
        // < firstMax chars remaining
        } else {
            arr[arr.length] = temp;
            temp = "";
        }
    }
    
    while (temp.length > 0) {
        // More than 2000 characters remaining
        if (temp.length >= 2000) {
            let end = temp.lastIndexOf(" ");
            arr[arr.length] = temp.substring(0, end);
            temp = temp.substring(end);
            
        // < 2000 chars remaining
        } else {
            arr[arr.length] = temp;
            temp = "";
        }
    }
    
    return arr;
}

/* Accepts the application array pulled from the applications spreadsheet, then outputs an array of strings shorter
 * than 2000 characters containing the contents of the application. This array is the array that the function exported
 * by this module returns. */
function formatApplication(application) {
    let arr = [];
    
    // Applicant data
    let metadata = application[0];
    arr[0] = "`Received " + metadata.time + "`\n**Applicant**: " + metadata.name
        + "\n<https://www.roblox.com/users/" + metadata.id + "/profile>";
        
    // Process responses
    for (let i = 1; i < application.length; i++) {
        // Format question string + split + insert into array
        let info = application[i];
        let qStr = "\n\n**" + info.q + "**\n"
        
        // If we have space left, append qStr to the last string in the array
        if (arr[arr.length - 1].length + qStr.length < 2000) {
            arr[arr.length - 1] = arr[arr.length - 1] + qStr;

        // otherwise just make it a new entry
        } else {
            arr[arr.length] = qStr;
        }
        
        // Split answer string
        let firstMax = 2000 - arr[arr.length - 1].length;
        let aStrs    = splitString(info.a, firstMax);
        
        // Answer string - first case
        arr[arr.length - 1] = arr[arr.length - 1] + aStrs[0];
        
        // Answer string - remaining substrings
        for (let j = 1; j < aStrs.length; j++) {
            arr[arr.length] = aStrs[j];
        }
    }
    
    return arr;
}

// =====================================================================================================================

/** Accepts a Roblox UserID and a division key (see parameter `div`) and fetches the application from specified Roblox
  * user for the specified division.
  * @param bot `bot` from the main thread.
  * @param sheet A `GoogleSpreadsheet` that's already authenticated.
  * @param userID A Roblox UserID. Must be a string or a number.
  * @param div A string matching one of the values in `config.appChannels`. These values must match the name of a
  * worksheet on the application database Google spreadsheet.
  * @returns A Promise that either passes `null` if an application is not found, or an array of strings, each of which
  * is less than 2000 characters long, that consist of the entire application in Discord-friendly chunks. The strings
  * are in order, and the array can be iterated from start to finish to print out or otherwise obtain the entire
  * application in the order that it is meant to be read in. Each string includes two newline characters for spacing
  * when printing out each string using a simple loop.
*/
module.exports = function(bot, sheet, userID, div) {
    return new Promise(async function(resolve, reject) {
        // Load worksheets
        await sheet.loadInfo().catch((err) => {
            return reject(err);
        });
        
        // Fetch the worksheet we want
        let worksheet = sheet.sheetsByTitle[div];
        if (!worksheet) {
            return reject("Worksheet for " + div + " not found");
        }
        
        // Get rows
        let rows = await worksheet.getRows().catch((err) => {
            return reject(err);
        });
        
        // Retrieve application
        let application = null;
        for (let row of rows) {
            if (row.key == userID) {
                // Parse data from worksheet
                let value = JSON.parse(row.value);
                if (!value[0]) break;
                
                // Parse the application info array
                application = JSON.parse(value[1]);
                break;
            }
        }
        
        // Return
        if (!application) {
            return resolve(null);
        }
        return resolve(formatApplication(application));
    });
}
