// Command to post verification instructions
"use strict";

// =====================================================================================================================

function main(message, args, bot) {
    // Guilds only
    if (message.channel.type != "text") {
        message.channel.send("You can only use this command in a normal text channel in a server!");
        bot.util.log(message, "Attempted to verify outside of server.");
        return;
    }
    
    message.channel.send("**" + message.member.displayName + "**, please head to <https://blox.link/verify>, sign in"
        + " at the __upper-right__ by pressing `Sign in with Discord`, select any TSU Discord server, and follow"
        + " the instructions to verify your Roblox account. Be sure to set it as your __primary account__ - I need"
        + " you to do that in order to work properly!\n\nOnce you're finished, come back and say `!verify -force`.");
    bot.util.log(message, "Forced verification instructions.");
}

// =====================================================================================================================

module.exports = {
    command: "reverify",
    aliases: null,
    hasArgs: false,
    func:    main
}
