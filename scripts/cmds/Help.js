// Help/Commands list
"use strict";

// ============================================================================

module.exports = {
    command: "help",
    aliases: ["cmds", "commands"],
    hasArgs: false,
    func: function(message, args, bot) {
        let cmds = `__**TSUBot**__ by 1230james

__**Public Commands**__
1. !help - Displays all commands and bot-related info in a direct message.
2. !verify [-force] - Fetches data from Roblox to update your name and roles in all TSU servers. If you haven't verified on the Bloxlink verification system, then a link to verify your account will be posted instead.
    • \`-force\` - Including the \`-force\` flag forces TSUBot to query Bloxlink's database for your Roblox account. Use it if you recently changed your primary account on Bloxlink.
    • !getroles - Alias for \`verify\`.
3. !reverify - Posts link to get verified on Bloxlink's verification system.

__**Moderator Commands**__
*Will only work for users with certain Discord permissions. Not for public use.*
1. !update <user> [-force] - Runs the \`verify\` command on the specified user's behalf.
    • Requires \`Administrator\` or \`Manage Roles\` permission.
    • \`user\` can either be a Discord user ID, server nickname, or Discord username (no discriminator). The latter two are case insensitive.
    • \`-force\`, if appended after the user, works the same way as \`verify -force\`.

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
        bot.util.log(message, "Sent commands to " + message.author.username);
    }
}
