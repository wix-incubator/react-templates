'use strict'
/**
 * @type {Chalk.ChalkModule}
 */
const chalk = require('chalk')
const _ = require('lodash')
const table = require('text-table')

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
    return count === 1 ? word : `${word}s`
}
/**
 * @param {number} line
 * @return {string}
 */
function lineText(line) {
    return line < 1 ? '' : line
}

module.exports = function (results) {
    results = _.groupBy(results, 'file')

    let output = '\n'
    let total = 0
    let errors = 0
    let warnings = 0
    let infos = 0
    let summaryColor = 'cyan'

    _.forEach(results, (result, k) => {
        const messages = result

        if (messages.length === 0) {
            return
        }

        total += messages.length
        output += chalk.underline(k) + '\n'

        output += table(
            messages.map(message => {
                let messageType

                if (message.level === 'ERROR') {
                    messageType = chalk.red('error')
                    summaryColor = 'red'
                    errors++
                } else if (message.level === 'WARN') {
                    messageType = chalk.yellow('warning')
                    summaryColor = 'yellow'
                    warnings++
                } else {
                    messageType = chalk.cyan('info')
                    infos++
                }

                return [
                    '',
                    lineText(message.line),
                    lineText(message.column),
                    messageType,
                    message.msg.replace(/\.$/, ''),
                    chalk.gray(message.ruleId || '')
                ]
            }),
            {
                align: ['', 'r', 'l'],
                stringLength: str => chalk.stripColor(str).length
            }
        ).split('\n').map(el => el.replace(/(\d+)\s+(\d+)/, (m, p1, p2) => chalk.gray(`${p1}:${p2}`))).join('\n') + '\n\n'
    })

    if (total > 0) {
        output += chalk[summaryColor].bold([
            '\u2716 ', total, pluralize(' message', total),
            ' (', errors, pluralize(' error', errors), ', ',
            warnings, pluralize(' warning', warnings), ', ',
            infos, pluralize(' info', infos), ')\n'
        ].join(''))
    }

    return total > 0 ? output : ''
}
