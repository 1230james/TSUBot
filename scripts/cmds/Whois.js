// Retrieve simple Roblox account information for a given Discord user
"use strict";

// =====================================================================================================================

async function main(message, args, bot) {
    // No args
    if (args[0] == "") {
        message.channel.send("**" + message.member.displayName + "**, you need to specify a user to update.\nThe"
            + " `update` command is for *verifying another user.* Are you looking for the `verify` or `getroles`"
            + " commands instead?");
        bot.util.log(message, "Attempted to update a user, but passed no args.");
        return;
    }
    
    // ACK
    let msg = await message.channel.send("**" + message.member.displayName + "**, I will now try to look up this user."
        + " Please wait...");
    bot.util.log(message, "Began user lookup; arg: '" + args[0] + "'");
    
    // Prep vars
    let userID;
    
    // Identify via mention, if provided
    if (message.mentions.members.size > 0) {
        bot.util.log(message, "User ID received via mention");
        let member = message.mentions.members.first();
        userID     = member.id;
        
    // or if ID was passed in as an argument
    } else {
        bot.util.log(message, "No mention received; checking argument...");
        if (Number.isNaN(parseInt(args[0]))) { // invalid arg
            msg.edit("**" + message.member.displayName + "**, your argument was invalid.\nYou must either mention the"
                + " user whose Roblox account you want to look up, or pass in the Discord user ID of that user.");
            bot.util.log(message, "Invalid argument - halting.");
            return;
        }
        userID = args[0];
    }
    
    // Get Roblox UserID
    let stopExecution = false;
    let robloxID = await bot.util.getRobloxUserID(userID).catch((err) => {
        msg.edit("An error occurred while fetching their UserID:\n" + err);
        message.channel.send("<@126516587258707969>");
        bot.util.log(message, "Error occurred while fetching Roblox UserID:");
        console.error(err);
        stopExecution = true;
    });
    if (stopExecution) return;
    
    // Check for failures
    console.log(robloxID);
    switch(robloxID) {
    case -1: // none found
        msg.edit("**" + message.member.displayName + "**, that user is not verified with Bloxlink.");
        bot.util.log(message, "Could not find user on Bloxlink's database.");
        return; // return, not break, because we want to end execution here
        
    case -2: // rate limit
        msg.edit("**" + message.member.displayName + "**, too many requests are being sent to Bloxlink's database"
            + " at this time. Please wait one minute before trying again.");
        bot.util.log(message, "Could not complete whois due to ratelimiting.");
        return;
    }
    
    // Get username
    let username = await bot.util.getRobloxUsername(robloxID).catch((err) => {
        // Continue execution, but make it known that an error occurred to the user.
        username = "Error occurred - could not resolve username.";
        bot.util.log(message, "Error occurred while fetching Roblox username:");
        console.error(err);
    });
    
    // Output
    msg.edit(
        "**Username:** " + username
        + "\n**UserID:** " + robloxID
        + "\n**Profile:** https://www.roblox.com/users/" + robloxID + "/profile"
    );
    bot.util.log(message, "Posted account information for Roblox user " + robloxID);
}

// =====================================================================================================================

module.exports = {
    command: "whois",
    aliases: null,
    hasArgs: true,
    func: main
}
