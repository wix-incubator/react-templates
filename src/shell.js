'use strict'
const _ = require('lodash')

/**
 * @param {CONTEXT} context
 * @return {number}
 */
function printResults(context) {
    const warnings = context.getMessages()
    const out = require(`./formatters/${context.options.format}`)(warnings)
    context.report(out)
    const grouped = _.groupBy(warnings, 'level')
    return grouped.ERROR ? grouped.ERROR.length : 0
}

module.exports = {printResults}
