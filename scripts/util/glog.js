// Console (global) log function

module.exports = {
    name: "glog",
    /** Prints a message into the console similar to the following:
      * [TSUBot @ Mon, 06 Apr 2020 22:32:59 GMT]: logMsg
      * Identical to `log.js`, except it doesn't require a Discord message.
      * @param logMsg The message to be printed into the console. */
    func: function(logMsg) {
        console.log("[TSUBot @ " + (new Date()).toUTCString() + "]: " + logMsg);
    }
}