'use strict';

/**
 * @type {Chalk.ChalkModule}
 */
var chalk = require('chalk');

/**
 * @param {MESSAGE} message
 * @return {string}
 */
function getMessageType(message) {
    if (message.level === 'WARN') {
        return chalk.yellow('warning');
    }
    if (message.level === 'ERROR') {
        return chalk.red('error');
    }
    return chalk.cyan('info');
}

module.exports = function (warnings, config) {
    var _ = require('lodash');
    var table = require('text-table');
    var verbosity = false;
    var UNICODE_HEAVY_MULTIPLICATION_X = '\u2716';

    function pluralize(n, single, plural) {
        return n === 1 ? single : plural;
    }

    function lineText(line) {
        return line < 1 ? '' : line;
    }

    // context.report(JSON.stringify(warnings, undefined, 2));
    var output = table(
        warnings.map(function (message) {
            return [
                '',
                message.file || '',
                lineText(message.line || 0),
                lineText(message.column || 0),
                getMessageType(message),
                // message.message.replace(/\.$/, ""),
                message.msg || ''
                // chalk.gray(message.ruleId)
            ];
        }),
        {
            align: ['', 'r', 'l'],
            stringLength: function (str) {
                return chalk.stripColor(str).length;
            }
        }
        //}
    );

    var buf = [];

    buf.push(output);

    var grouped = _.groupBy(warnings, 'level');

    var errCount = grouped.ERROR ? grouped.ERROR.length : 0;
    var warnCount = grouped.WARN ? grouped.WARN.length : 0;
    //var infoCount = grouped.INFO ? grouped.INFO.length : 0;

//    buf.push(errCount + ' ' + warnCount + ' ' + infoCount + '\n');

    if (errCount === 0 && warnCount === 0) {
        buf.push(chalk.green('React templates done'));
    } else {
        var msg = [];
        if (errCount > 0) {
            msg.push(errCount + ' ' + pluralize(errCount, 'error', 'errors'));
        } else {
            msg.push(warnCount + ' ' + pluralize(warnCount, 'warning', 'warnings'));
        }
        buf.push(chalk.red.bold(UNICODE_HEAVY_MULTIPLICATION_X + ' ' + msg.join(', ')));
        if (errCount > 0) {
            buf.push(chalk.red('React templates failed due to errors'));
        } else {
            buf.push(chalk.yellow('React templates done with warnings'));
        }
    }

//                context.report(JSON.stringify(grouped, undefined, 2));
//    if (grouped.ERROR && grouped.ERROR.length > 0) {
////        throw new Error(errorMessages.VERIFY_FAILED.format(grouped.ERROR.length, pluralize(grouped.ERROR.length, 'error', 'errors')));
//    } else {
//        buf.push(chalk.red.bold(UNICODE_HEAVY_MULTIPLICATION_X + ' ' + warnings.length + ' ' + pluralize(warnings.length, 'problem', 'problems')) + '\n');
//        buf.push('React templates done with warnings\n');
//    }
    return buf.join('\n');
};