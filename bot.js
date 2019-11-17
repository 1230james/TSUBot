var forever = require('forever-monitor'); 
var readline = require('readline'); 
var input = readline.createInterface({ 
	input: process.stdin,
	output: process.stdout
});

var bot = new (forever.Monitor)('botscript.js', { 
	max: 99999, 
	silent: false, 
	args: [],
	killTree: true 
});

bot.on('start', function() { 
	input.question("=== TYPE ANYTHING TO KILL THE BOT===\n\n\n", (answer) => { 
		if (answer) { 
			bot.max = 0;
			bot.kill(); 
		}
		input.close();
	})
});

bot.on('exit', function() {
	console.log("Bot has been killed.\nPlease restart it manually.");
});

bot.start();

// For comments, check bot.js in WrightBot's or The Melting Bot's directory.