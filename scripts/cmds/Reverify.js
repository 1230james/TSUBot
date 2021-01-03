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
    
    message.channel.send(`**${message.member.displayName}**, please head to <https://blox.link> to verify and set your primary account.

__Instructions__
• If you aren't already signed in, please click \`Sign in with Discord\` in the upper-right.
• Visit this page: <https://blox.link/verification/485528044828753940>
• Scroll down to \`Link A New Account To This Server\` and follow the instructions to verify your Roblox account.
• **Remember to CHECK the \`Set this as your primary account\` box!**
• Once complete, visit this page: <https://blox.link/account>, and double-check to make sure your primary account is set correctly.
• After you've finished everything above, come back here and say \`!verify -force\`.`);
    bot.util.log(message, "Forced verification instructions.");
}

// =====================================================================================================================

module.exports = {
    command: "reverify",
    aliases: null,
    hasArgs: false,
    func:    main
}
