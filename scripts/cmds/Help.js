// Help/Commands list
"use strict";

// Libraries
const log = require(__dirname + "/../util/Log.js").func;

// ============================================================================

module.exports = {
    command: "help",
    aliases: ["cmds", "commands"],
    hasArgs: false,
    func: function(message) {
        let cmds = `__**TSUBot**__ by 1230james

__**Public Commands**__
1. !help - Displays all commands and bot-related info in a direct message.
2. !verify [-force] - Fetches data from Roblox to update your name and roles in all TSU servers. If you haven't verified on the RoVer verification system, then a link to verify your account will be posted instead.
    - !getroles - Alias for \`verify\`.
3. !reverify - Posts link to get verified on RoVer's verification system.

__**Application Commands**__
*Will only work in application-reading channels. Not for public use.*
1. !list - Lists all unprocessed applications.
2. !view <username> - Fetches the application sent by the provided user.
3. !accept <username> - Accepts \`username\`'s application, accepting them into the respective group and updating their ranks accordingly, then marking the application as processed.
4. !deny <username> - Denies \`username\`'s application, marking their application as processed.`

        if (message.channel.type != 'dm') {
            message.channel.send("<@" + message.author.id + ">, information has been sent to you via DM.");
            // For some reason message.author doesn't parse into a mention? I think it's a bug based on the discord.js docs
        }
        message.author.send(cmds);
        log(message, "Sent commands to " + message.author.username);
    }
}
