'use strict';
var _ = require('lodash');

/**
 * @param {CONTEXT} context
 * @return {number}
 */
function printResults(context) {
    var warnings = context.getMessages();
    var out = require(`./formatters/${context.options.format}`)(warnings);
    context.report(out);
    var grouped = _.groupBy(warnings, 'level');
    return grouped.ERROR ? grouped.ERROR.length : 0;
}

module.exports = {printResults};
