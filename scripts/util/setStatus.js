// Roblox set status

function foo(resolve, reject, Roblox, statusMsg) {
    Roblox.getCurrentUser("UserID").then(userId => {
        Roblox.http(
            "https://users.roblox.com/v1/users/" + userId + "/status",
            {
                method: "PATCH",
                inputs: {
                    status: statusMsg
                }
            }
        ).then(function (res) {
            return resolve(res);
            /*if (res.statusCode === 200) {
                resolve();
            } else {
                reject(res);
            }*/
        }).catch(err => {
            return reject(err);
        });
    }).catch(err => {
        return reject(err);
    });
}

module.exports = {
    name: "setStatus",
    /** Sets the status on the Roblox account the bot is currently logged in as to `statusMsg`.
      * @param Roblox `noblox.js` module. Require it from the main script and pass it in.
      * @param statusMsg The message to set the user status to. */
    func: function(Roblox, statusMsg) {
        return new Promise((resolve, reject) => {
            foo(resolve, reject, Roblox, statusMsg);
        });
    }
}