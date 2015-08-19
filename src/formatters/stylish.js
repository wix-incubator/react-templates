'use strict';
/**
 * @type {Chalk.ChalkModule}
 */
var chalk = require('chalk');
var _ = require('lodash');
var table = require('text-table');

///**
// * @param {MESSAGE} message
// * @return {string}
// */
//function getMessageType(message) {
//    if (message.level === 'WARN') {
//        return chalk.yellow('warning');
//    }
//    if (message.level === 'ERROR') {
//        return chalk.red('error');
//    }
//    return chalk.cyan('info');
//}

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return count === 1 ? word : word + 's';
}

//function pluralize(n, single, plural) {
//    return n === 1 ? single : plural;
//}

/**
 * @param {number} line
 * @return {string}
 */
function lineText(line) {
    return line < 1 ? '' : line;
}

//module.exports = function (warnings/*, config*/) {
//    var _ = require('lodash');
//    var table = require('text-table');
//    //var verbosity = false;
//    var UNICODE_HEAVY_MULTIPLICATION_X = '\u2716';
//
//    // context.report(JSON.stringify(warnings, undefined, 2));
//    var output = table(
//        warnings.map(function (message) {
//            return [
//                '',
//                message.file || '',
//                lineText(message.line || 0),
//                lineText(message.column || 0),
//                getMessageType(message),
//                // message.message.replace(/\.$/, ''),
//                message.msg || ''
//                // chalk.gray(message.ruleId)
//            ];
//        }),
//        {
//            align: ['', 'r', 'l'],
//            stringLength: function (str) {
//                return chalk.stripColor(str).length;
//            }
//        }
//        //}
//    );
//
//    var buf = [];
//
//    buf.push(output);
//
//    var grouped = _.groupBy(warnings, 'level');
//
//    var errCount = grouped.ERROR ? grouped.ERROR.length : 0;
//    var warnCount = grouped.WARN ? grouped.WARN.length : 0;
//    //var infoCount = grouped.INFO ? grouped.INFO.length : 0;
//
////    buf.push(errCount + ' ' + warnCount + ' ' + infoCount + '\n');
//
//    if (errCount === 0 && warnCount === 0) {
//        buf.push(chalk.green('React templates done'));
//    } else {
//        var msg = [];
//        if (errCount > 0) {
//            msg.push(errCount + ' ' + pluralize(errCount, 'error', 'errors'));
//        } else {
//            msg.push(warnCount + ' ' + pluralize(warnCount, 'warning', 'warnings'));
//        }
//        buf.push(chalk.red.bold(UNICODE_HEAVY_MULTIPLICATION_X + ' ' + msg.join(', ')));
//        if (errCount > 0) {
//            buf.push(chalk.red('React templates failed due to errors'));
//        } else {
//            buf.push(chalk.yellow('React templates done with warnings'));
//        }
//    }
//
////                context.report(JSON.stringify(grouped, undefined, 2));
////    if (grouped.ERROR && grouped.ERROR.length > 0) {
//////        throw new Error(errorMessages.VERIFY_FAILED.format(grouped.ERROR.length, pluralize(grouped.ERROR.length, 'error', 'errors')));
////    } else {
////        buf.push(chalk.red.bold(UNICODE_HEAVY_MULTIPLICATION_X + ' ' + warnings.length + ' ' + pluralize(warnings.length, 'problem', 'problems')) + '\n');
////        buf.push('React templates done with warnings\n');
////    }
//    return buf.join('\n');
//};

module.exports = function (results) {
    results = _.groupBy(results, 'file');

    var output = '\n',
        total = 0,
        errors = 0,
        warnings = 0,
        infos = 0,
        summaryColor = 'cyan';

    _.forEach(results, function (result, k) {
        var messages = result;

        if (messages.length === 0) {
            return;
        }

        total += messages.length;
        output += chalk.underline(k) + '\n';

        output += table(
            messages.map(function (message) {
                var messageType;

                if (message.level === 'ERROR') {
                    messageType = chalk.red('error');
                    summaryColor = 'red';
                    errors++;
                } else if (message.level === 'WARN') {
                    messageType = chalk.yellow('warning');
                    summaryColor = 'yellow';
                    warnings++;
                } else {
                    messageType = chalk.cyan('info');
                    infos++;
                }

                return [
                    '',
                    lineText(message.line),
                    lineText(message.column),
                    messageType,
                    message.msg.replace(/\.$/, ''),
                    chalk.gray(message.ruleId || '')
                ];
            }),
            {
                align: ['', 'r', 'l'],
                stringLength: function (str) {
                    return chalk.stripColor(str).length;
                }
            }
        ).split('\n').map(function (el) {
                return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
                    return chalk.gray(p1 + ':' + p2);
                });
            }).join('\n') + '\n\n';
    });

    if (total > 0) {
        output += chalk[summaryColor].bold([
            '\u2716 ', total, pluralize(' message', total),
            ' (', errors, pluralize(' error', errors), ', ',
            warnings, pluralize(' warning', warnings), ', ',
            infos, pluralize(' info', infos), ')\n'
        ].join(''));
    }

    return total > 0 ? output : '';
};