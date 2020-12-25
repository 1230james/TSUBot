// Functions for TSU division application handling
// Retrieve list of unread applications
"use strict";

// =====================================================================================================================

/* Takes in an array of `GoogleSpreadsheetRow`s that have a `key` property that contains a Roblox UserID, then returns
 * a Promise that passes an array of strings containing the usernames associated with every Roblox UserID found in the
 * rows. */
function getApplicantNames(bot, rows) {
    return new Promise(async (resolve, reject) => {
        let arr = [];
        for (let row of rows) {
            // Skip blank rows (or rows that are malformed by having a blank value in the "key" column)
            if (!row.key) continue;
            
            // Get name
            let name = await bot.util.getRobloxUsername(row.key).catch((err) => {
                return reject(err);
            });
            
            // and add it to the array
            if (name) {
                arr.push(name);
            }
        }
        return resolve(arr);
    });
}

// =====================================================================================================================

/** Accepts a division key (see parameter `div`) and fetches the list of unread applications for the specified division.
  * @param bot `bot` from the main thread.
  * @param sheet A `GoogleSpreadsheet` that's already authenticated that contains the application spreadsheet.
  * @param div A string matching one of the values in `config.appChannels`. These values must match the name of a
  * worksheet on the application database Google spreadsheet.
  * @returns A Promise that passes an array of strings that contains zero or more usernames of people who have
  * unread applications for the specified division.
*/
module.exports = function(bot, sheet, div) {
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
        
        // Retrieve names
        let names = await getApplicantNames(bot, rows).catch((err) => {
            return reject(err);
        });
        
        // Return
        return resolve(names);
    });
}