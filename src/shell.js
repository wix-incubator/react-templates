'use strict';
/**
 * @return {number}
 */
function printResults(context) {
    var _ = require('lodash');
//    var wfs = require('./wfs');
    var warnings = context.getMessages();
    var out = require('./formatters/' + context.options.format)(warnings);
//        if (context.options.outFile) {
//            wfs.file.write(context.options.outFile, out);
//        } else {
//            context.report(out);
//        }
    context.report(out);
    var grouped = _.groupBy(warnings, 'level');
    return grouped.ERROR ? grouped.ERROR.length : 0;
}

module.exports = {
    printResults: printResults
};