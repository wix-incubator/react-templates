'use strict';
/**
 * @return {number}
 */
function printResults(context) {
    var _ = require('lodash');
//    var wfs = require('./wfs');

    var errorCount = 0;
    var warnings = context.getMessages();
    var out = require('./formatters/' + context.options.format)(warnings);
//        if (context.options.outFile) {
//            wfs.file.write(context.options.outFile, out);
//        } else {
//            context.report(out);
//        }
    context.report(out);
    var grouped = _.groupBy(warnings, 'level');
    errorCount = grouped.ERROR ? grouped.ERROR.length : 0;
    return errorCount;
}

/**
 * print help for a command
 * @param {string} command
 * @return {number}
 */
//function printHelp(command) {
//    var wfs = require('./wfs');
//    var path = require('path');
//    var h = wfs.readJSON(path.resolve(__dirname, 'data/help.json'));
//    var commandHelp = h.commands[command];
//    if (!commandHelp) {
//        console.log('could not find help for command ' + command);
//        return 1;
//    }
//    var msg = 'SYNOPSIS\n' +
//        '   ' + commandHelp.SYNOPSIS + '\n' +
//        'DESCRIPTION\n' +
//        '   ' + commandHelp.DESCRIPTION;
//    console.log(msg);
//    return 0;
//}

module.exports = {
    printResults: printResults//,
//    printHelp: printHelp
};