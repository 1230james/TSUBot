// Handle management of TSU Discord server roles
// Front-end for utility script loader
"use strict";

// =====================================================================================================================

/** Takes in a Discord Message and a TSU ranks table, then based on the contents of the table, it will assign roles in
  * all TSU Discords for the Message's author.
  * @param message A `Message`. Ideally, it should be the one that contains the verify command. If the user specified is
  * not verified with Bloxlink, verification instructions will be sent to the channel this message is located in.
  * @param bot The `bot` from the main thread.
  * @param ranks Output of `bot.util.getTSURanks`'s Promise.
  * @returns A Promise which passes nothing.
*/
// function signature: function main(message, bot, ranks)
const main = require("./handleTSUDiscordRoles/main.js");

module.exports = {
    name: "handleTSUDiscordRoles",
    func: main
}