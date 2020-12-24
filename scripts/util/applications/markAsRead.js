// Functions for TSU division application handling
// Mark an application as read and remove it from the application spreadsheet
"use strict";

// =====================================================================================================================

/** Accepts a Roblox UserID and a division key (see parameter `div`) and marks the application from the user for the
  * given division as read by removing it from the application spreadsheet.
  * @param bot `bot` from the main thread.
  * @param sheet A `GoogleSpreadsheet` that's already authenticated that contains the application spreadsheet.
  * @param userID A Roblox UserID. Must be a string or a number.
  * @param div A string matching one of the values in `config.appChannels`. These values must match the name of a
  * worksheet on the application database Google spreadsheet.
  * @returns A Promise that passes a number. If the application was located and successfully deleted, 0 is passed. If
  * no application was found, but the function otherwise executed with no issues, 1 is passed.
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
        for (let row of rows) {
            if (row.key == userID) {
                // Delete it
                await row.delete();
                return resolve(0);
            }
        }
        
        // Aaaaand we're done
        return resolve(1);
    });
}
