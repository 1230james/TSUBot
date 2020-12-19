// Command script template
"use strict";

// Libraries

// =====================================================================================================================

module.exports = {
    command: "commandinlowercasehere",
    aliases: null,  // Use the following array if you want aliases: ["alias1", "alias2"]
                    // Otherwise, leave it null. You can technically have an
                    // empty array for the same functionality, but it'll be
                    // a bit slower.
    hasArgs: false, // Whether this command has arguments; used by the main
                    // script while checking user input for commands. If false,
                    // the main script will match the command using the ==
                    // operator. Else, it will use a more complex comparison
                    // involving String.startsWith().
    func: function(message, args, bot) {
        // code to run when command runs
    }
}