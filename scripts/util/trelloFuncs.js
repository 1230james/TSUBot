// Functions to abstract making HTTP calls to the TSU Trello database board
"use strict";

const Trello = require("trello");

// Trello stuff
var trello = null; // instantiate later when we have access to bot.util
var trelloBoards;
var databaseBoard;
var databaseLists; // Should look like this if the initialization code runs okay https://gyazo.com/52215bfb918e49097c6d5c924430eed0

// =====================================================================================================================

function initializeLists(key, token) {
    return new Promise((resolve, reject) => {
        // initialize trello
        if (trello) {
            return resolve();
        }
        trello = new Trello(key, token);
        
        // initialize lists
        trello.getBoards("me").then((boards) => {
            trelloBoards = boards;
            for (let board of trelloBoards) {
                if (board.shortLink == "FGv7dILw") {
                    databaseBoard = board;
                    break;
                }
            }
            if (typeof(databaseBoard) == "undefined") { 
                return reject("Database Trello board not found.");
            }
            trello.getListsOnBoard(databaseBoard.id).then(function(lists) {
                databaseLists = lists;
                return resolve();
            });
        });
    });
}

function setResult(userID,list,result,index) {
	for (let card of list) {
		if (card.name == userID) {
			result[index] = (card.desc == "true");
			break;
		}
	}
	return result;
}

// =====================================================================================================================

// Most, if not all, of the code in this section is recycled code from the old TSUBot

 function getStatusFunc(userID, util) {
    return new Promise(async function(resolve, reject) {
        await initializeLists(util.keys.trello.key, util.keys.trello.token);
        
        let dcList;
        let prisonerList;
        let result = [false,false];
        for (let list of databaseLists) {
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
                return resolve(result);
            }).catch(err => {reject(err);});
        }).catch(err => {reject(err);});
	});
}

function isUserPrisonerFunc(userID, util) {
    return new Promise(async function(resolve, reject) {
        await initializeLists(util.keys.trello.key, util.keys.trello.token);
        
        let prisonerList;
        for (let list of databaseLists) {
            if (list.name == "Prisoners") {
                prisonerList = list;
                break;
            }
        }
        trello.getCardsOnList(prisonerList.id).then(prisonerListCards => {
            for (let card of prisonerListCards) {
                if (card.name == userID) {
                    return resolve((card.desc == "true")); // Double parentheses probs not necessary
                }
            }
            resolve(false);
        }).catch(err => {reject(err);});
	});
}

// =====================================================================================================================

module.exports = {
    name: "trelloFuncs",
    func: { // gonna hijack my own system, but we don't need to tell anyone that :)
        "getStatus":      getStatusFunc,
        "isUserPrisoner": isUserPrisonerFunc
    }
}
