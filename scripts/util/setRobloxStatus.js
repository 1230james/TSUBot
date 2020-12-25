// Roblox set status

function getHttpOpt(Roblox, statusMsg) {
    return new Promise((resolve, reject) => {
        Roblox.getCurrentUser("UserID").then(userId => {
            let session = Roblox.getSession();
            let jar     = {session: session}; // this is so retarded but Roblox.jar() isn't working out so
            Roblox.getGeneralToken({jar: jar}).then(xcsrf => {
                return resolve({ // god why is JavaScript literally Layersville out here? Just count those indents dude
                    url: `//users.roblox.com/v1/users/${userId}/status`,
                    options: {
                        method: "PATCH",
                        jar: jar,
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": xcsrf
                        },
                        body: JSON.stringify({
                            status: statusMsg
                        })
                    }
                });
            }).catch(err => {
                return reject(err);
            });
        }).catch(err => {
            return reject(err);
        });
    });
}

function foo(resolve, reject, Roblox, statusMsg) {
    getHttpOpt(Roblox, statusMsg).then(httpOpt => {
        Roblox.http(httpOpt).then(function(res) {
            return resolve(JSON.parse(res));
        }).catch(err => {
            return reject(err);
        });
    }).catch(err => {
        return reject(err);
    });
}

module.exports = {
    name: "setRobloxStatus",
    /** Sets the status on the Roblox account the bot is currently logged in as to `statusMsg`.
      * @param Roblox `noblox.js` module. Require it from the main script and pass it in.
      * @param statusMsg The message to set the user status to. */
    func: function(Roblox, statusMsg) {
        return new Promise((resolve, reject) => {
            foo(resolve, reject, Roblox, statusMsg);
        });
    }
}
