// Variables
const Discord = require("discord.js");
const prefix = "!";
const moment = require("moment");
const log = (msg) => { // Console log w/ timestamp
	console.log(`[TSUBot ${moment().format("MM-DD-YYYY HH:mm:ss")}] ${msg}`);
};

// Trello stuff
const Trello = require("trello");
const trello = new Trello("4baedecfb6dc03421f4181268a01795b","440161e3b673b632862265bef6e591a269bd7b586e3dfa4680b98f58d231f17b");
var trelloBoards;
var databaseBoard;
var databaseLists; // Should look like this if the code below runs okay https://gyazo.com/52215bfb918e49097c6d5c924430eed0
trello.getBoards("me").then(function(boards) {
	trelloBoards = boards;
	for (board of trelloBoards) {
		if (board.shortLink == "FGv7dILw") {
			databaseBoard = board;
			break;
		}
	}
	if (typeof(databaseBoard) == "undefined") { throw "Database Trello board not found."; }
	trello.getListsOnBoard(databaseBoard.id).then(function(lists) {
		databaseLists = lists;
	});
});

// ============================================================================

function setResult(userID,list,result,index) {
	for (card of list) {
		if (card.name == userID) {
			result[index] = (card.desc == "true");
			break;
		}
	}
	return result;
}

exports.getStatus = function(userID) {
	return new Promise(function(resolve, reject) {
		try {
			let dcList;
			let prisonerList;
			let result = [false,false];
			for (list of databaseLists) {
				if (list.closed) continue;
				if (list.name == "Distinguished Citizens") {
					dcList = list;
				} else if (list.name == "Prisoners") {
					prisonerList = list;
				}
				if (dcList && prisonerList) break;
			}
			trello.getCardsOnList(dcList.id).then(dcListCards => {
				result = setResult(userID,dcListCards,result,0);
				trello.getCardsOnList(prisonerList.id).then(prisonerListCards => {
					result = setResult(userID,prisonerListCards,result,1);
					console.log(result);
					resolve(result);
				}).catch(err => {reject(err);});
			}).catch(err => {reject(err);});
		} catch(err) {
			reject(err);
		}
	});
}

exports.isUserPrisoner = function(userID) {
	return new Promise(function(resolve, reject) {
		try {
			let prisonerList;
			for (list of databaseLists) {
				if (list.name == "Prisoners") {
					prisonerList = list;
					break;
				}
			}
			trello.getCardsOnList(prisonerList.id).then(prisonerListCards => {
				for (card of prisonerListCards) {
					if (card.name == userID) {
						return resolve((card.desc == "true")); // Double parentheses probs not necessary
					}
				}
				resolve(false);
			}).catch(err => {reject(err);});
		} catch(err) {
			reject(err);
		}
	});
}