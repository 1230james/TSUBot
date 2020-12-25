// Get list of unread applications
"use strict";

// =====================================================================================================================

async function main(message, args, bot) {
    let stopExecution = false;
    
    // App channels only
    let divKey = bot.util.config.appChannels[message.channel.id];
    if (!divKey) {
        return; // reject silently
    }
    
    // Post ACK message
    bot.util.log(message, "Fetching applications");
    let msg = await message.channel.send("Fetching applications. Please wait - this may take a while...");
    
    // Retrieve applicant list
    let applicants = await bot.util.applications.getAppList(bot, bot.util.dbSheet, divKey).catch((err) => {
        msg.edit("An error occurred while fetching applications.");
        message.channel.send("<@126516587258707969>\n" + err);
        bot.util.log(message, "Error occurred while fetching applicatons:");
        console.error(err);
        stopExecution = true;
    });
    if (stopExecution) return;
    
    // Print application
    msg.delete();
    let index = 0;
    let str   = "**__Pending Applications__**";
    let timer = setInterval(() => {
        // Append applicants to string
        while (str.length < 1950 && index < applicants.length) {
            str += "\n" + applicants[index];
            index++;
        }
        
        // Send it
        message.channel.send(str);
        
        // If we're finished
        if (index >= applicants.length) {
            clearInterval(timer);
            bot.util.log(message, "Applications fetched successfully.");
            
        // or if we're not
        } else {
            str = "";
        }
    }, 100);
}

// =====================================================================================================================

module.exports = {
    command: "list",
    aliases: null,
    hasArgs: false,
    func:    main
}
