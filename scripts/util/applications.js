// Functions for TSU division application handling
// Front-end for utility script loader
"use strict";

// =====================================================================================================================

const getAppList = require("./applications/getAppList.js");
const markAsRead = require("./applications/markAsRead.js");

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
const viewApp = require("./applications/viewApp.js");

// =====================================================================================================================

module.exports = {
    name: "applications",
    func: { // i am once again hijacking my own system
        getAppList: getAppList,
        markAsRead: markAsRead,
        viewApp:    viewApp
    }
}
