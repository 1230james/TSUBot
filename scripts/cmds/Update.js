// Update other user command
"use strict";

// =====================================================================================================================

async function main(message, args, bot) {
    // Guilds only
    if (message.channel.type != "text") {
        message.channel.send("You can only use this command in a normal text channel in a server!");
        bot.util.log(message, "Attempted to update a user outside of a server.");
        return;
    }
    
    // No args
    if (args[0] == "") {
        message.channel.send("**" + message.member.displayName + "**, you need to specify a user to update.\nThe"
            + " `update` command is for *verifying another user.* Are you looking for the `verify` or `getroles`"
            + " commands instead?");
        bot.util.log(message, "Attempted to update a user, but passed no args.");
        return;
    }
    
    // Mods only
    if ( !(message.member.hasPermission("MANAGE_ROLES")) && !(message.member.hasPermission("ADMINISTRATOR")) ) {
        message.channel.send("**" + message.member.displayName + "**, you can only use this command if you are an"
            + " administrator or if you have the `Manage Roles` permission!");
        bot.util.log(message, "Attempted to update a user with insufficient permissions.");
        return;
    }
    
    // Pre-search housekeeping
    message.channel.send("**" + message.member.displayName + "**, I will now try to verify the user you specified.");
    bot.util.log(message, "Began user update; userStr: '" + args[0] + "'");
    
    // Prep vars
    let userStr      = args[0];
    let targetMember = undefined;
    
    // Identify via mention, if provided
    if (message.mentions.members.size > 0) {
        bot.util.log(message, "Located user via mention");
        targetMember = message.mentions.members.first();
    }
    
    // Identify the user by Discord snowflake first
    if (!targetMember) {
        bot.util.log(message, "Locating user via snowflake");
        targetMember = await message.guild.members.fetch(userStr).catch((err) => {
            /*
            if (!err.message.includes("Unknown User") && !err.message.includes("not snowflake")) {
                message.channel.send("**" + message.member.displayName + "**, an error occurred.\n\n"
                    + "Snowflake identification error:\n" + err);
                bot.util.log(message, "Error occurred while fetching member via snowflake:");
                console.error(err);
                return;
            }
            */
        });
    }
    
    // If that didn't work, search by username & nickname
    if (!targetMember) {
        // Fetch results
        bot.util.log(message, "Locating user via username...");
        let results = await message.guild.members.fetch({
            query: userStr,
            time:  30000 // not sure if these are supposed to seconds or milliseconds; gonna guess ms
        }).catch((err) => {
            message.channel.send("**" + message.member.displayName + "**, an error occurred.\n\n"
                + "Username identification error:\n" + err);
            bot.util.log(message, "Error occurred while fetching member via username:");
            console.error(err);
            return;
        });
        
        // Process
        let LUS      = userStr.toLowerCase();
        targetMember = results.find((mem) => mem.displayName.toLowerCase() == LUS || mem.user.username.toLowerCase() == LUS);
    }
    
    // If we found them
    if (targetMember) {
        message.channel.send("**" + message.member.displayName + "**, I have identified the user **"
            + targetMember.displayName + "**, and will now proceed to verify them.");
        let fakeMessage = { // hijacking time
            channel: message.channel,
            author:  targetMember.user,
            member:  targetMember
        };
        if (args[1] == "-force") {
            bot.util.verifyUser(fakeMessage, bot, targetMember.id, true);
        } else {
            bot.util.verifyUser(fakeMessage, bot, targetMember.id, false);
        }
    }
    
    // or if we didn't
    else {
        message.channel.send("**" + message.member.displayName + "**, I could not find the user you are trying to"
            + " update.\nMake sure you entered their Discord user ID or username correctly.");
        bot.util.log(message, "Unable to locate user to update.");
    }
}

// =====================================================================================================================

module.exports = {
    command: "update",
    aliases: null,
    hasArgs: true,
    func: main
}
